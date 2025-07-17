// src/mediaQueue.ts

import Dexie, { Table } from 'dexie';
import { toast } from 'react-toastify';

// --- INTERFACES E TIPOS --- //

type MediaType = 'image' | 'video';
type UploadStatus = 'pending' | 'uploading' | 'failed';

export interface IUploadQueueItem {
  id?: number;
  file: ArrayBuffer;             // guardamos como ArrayBuffer para melhor compatibilidade
  type: MediaType;
  name: string;
  size: number;
  status: UploadStatus;
  createdAt: number;
}

// --- CONFIGURAÇÃO DO BANCO DE DADOS --- //

class AppDB extends Dexie {
  uploadQueue!: Table<IUploadQueueItem>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      uploadQueue: '++id, status'
    });
  }
}

const db = new AppDB();

// --- VARIÁVEIS DE AMBIENTE --- //

const AD_ACCOUNT_ID = process.env.REACT_APP_AD_ACCOUNT_ID!;
const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN!;
const META_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

if (!AD_ACCOUNT_ID || !ACCESS_TOKEN) {
  console.error('Faltam variáveis de ambiente REACT_APP_AD_ACCOUNT_ID ou REACT_APP_ACCESS_TOKEN');
}

// --- FUNÇÕES PRINCIPAIS --- //

/**
 * Enfileira um arquivo para upload. Se estiver online, dispara o processamento automático.
 */
export async function enqueueMediaUpload(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const type: MediaType = file.type.startsWith('image/') ? 'image' : 'video';

  const id = await db.uploadQueue.add({
    file: buffer,
    type,
    name: file.name,
    size: file.size,
    status: 'pending',
    createdAt: Date.now()
  });

  // Tenta processar imediatamente se online
  if (navigator.onLine) {
    processUploadQueue().catch(err =>
      console.error('Erro ao processar fila após enfileirar:', err)
    );
  } else {
    toast.info('Offline: upload ficará em fila');
  }

  return id;
}

/**
 * Processa todos os itens pendentes na fila, enviando para a API da Meta.
 */
export async function processUploadQueue(): Promise<void> {
  if (!navigator.onLine) {
    toast.info('Offline: uploads ainda pendentes na fila');
    return;
  }

  const pending = await db.uploadQueue.where('status').equals('pending').toArray();
  if (pending.length === 0) return;

  for (const item of pending) {
    if (!item.id) continue;
    const { id, file, type, name, size } = item;

    try {
      await db.uploadQueue.update(id, { status: 'uploading' });

      if (type === 'image') {
        await uploadImageToMeta(name, file);
      } else {
        await uploadVideoToMeta(name, size, file);
      }

      await db.uploadQueue.delete(id);
      toast.success(`Upload de "${name}" concluído`);

    } catch (err: any) {
      console.error(`Erro no upload de ${name}:`, err);
      await db.uploadQueue.update(id, { status: 'failed' });
      toast.error(`Falha no upload de "${name}", será tentado novamente`);
    }
  }
}

// --- LISTENER PARA RECONEXÃO --- //

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    toast.info('Reconectado: enviando uploads pendentes');
    processUploadQueue().catch(console.error);
  });
}

// --- FUNÇÕES AUXILIARES PARA UPLOAD --- //

async function uploadImageToMeta(name: string, buffer: ArrayBuffer) {
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('access_token', ACCESS_TOKEN);
  form.append('name', name);
  form.append('bytes', blob);

  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/adimages`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    throw new Error('Falha ao enviar imagem para a Meta');
  }

  return res.json();
}

async function uploadVideoToMeta(
  name: string,
  _size: number,
  buffer: ArrayBuffer
) {
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('access_token', ACCESS_TOKEN);
  form.append('name', name);
  form.append('source', blob);

  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/advideos`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    throw new Error('Falha ao enviar vídeo para a Meta');
  }

  return res.json();
}

// --- TIPOS E FUNÇÕES DA API --- //

export interface IBudgetItem {
  id: string;
  name: string;
  currentBudget: number;
}

export async function fetchBudgetItems(): Promise<IBudgetItem[]> {
  const url =
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/adsets` +
    `?fields=id,name,daily_budget,lifetime_budget&access_token=${ACCESS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Erro ao buscar orçamentos');
  }
  const data = await res.json();
  return (data.data || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    currentBudget: Number(i.daily_budget || i.lifetime_budget || 0),
  }));
}

export async function updateBudget(
  id: string,
  value: number
): Promise<void> {
  const body = new URLSearchParams();
  body.append('access_token', ACCESS_TOKEN);
  body.append('daily_budget', value.toString());
  const res = await fetch(`${META_GRAPH_API_URL}/${id}`, {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    throw new Error('Erro ao atualizar orçamento');
  }
}

export async function createCampaign(
  name: string,
  objective: string
): Promise<string> {
  const body = new URLSearchParams();
  body.append('access_token', ACCESS_TOKEN);
  body.append('name', name);
  body.append('objective', objective);
  body.append('status', 'PAUSED');
  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/campaigns`,
    { method: 'POST', body }
  );
  if (!res.ok) {
    throw new Error('Erro ao criar campanha');
  }
  const json = await res.json();
  return json.id;
}

export async function createAdSet(
  campaignId: string,
  audienceId: string,
  budget: { type: 'DAILY' | 'LIFETIME'; value: number }
): Promise<string> {
  const body = new URLSearchParams();
  body.append('access_token', ACCESS_TOKEN);
  body.append('campaign_id', campaignId);
  if (budget.type === 'DAILY') {
    body.append('daily_budget', budget.value.toString());
  } else {
    body.append('lifetime_budget', budget.value.toString());
  }
  body.append(
    'targeting',
    JSON.stringify({ custom_audiences: [{ id: audienceId }] })
  );
  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/adsets`,
    { method: 'POST', body }
  );
  if (!res.ok) {
    throw new Error('Erro ao criar conjunto de anúncios');
  }
  const json = await res.json();
  return json.id;
}

export async function createAd(
  adSetId: string,
  message: string,
  files: File[]
): Promise<string> {
  const form = new FormData();
  form.append('access_token', ACCESS_TOKEN);
  form.append('adset_id', adSetId);
  form.append('name', 'Anuncio');
  form.append('message', message);
  if (files.length) {
    form.append('source', files[0]);
  }
  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/ads`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    throw new Error('Erro ao criar anúncio');
  }
  const json = await res.json();
  return json.id;
}

export async function getInsights(
  level: string,
  since: string,
  until: string
): Promise<any[]> {
  const url =
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/insights` +
    `?level=${level}&time_range[since]=${since}&time_range[until]=${until}` +
    `&fields=spend,clicks,actions&access_token=${ACCESS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Erro ao obter insights');
  }
  const json = await res.json();
  return json.data || [];
}

export { db };
