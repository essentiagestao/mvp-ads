// src/mediaQueue.ts

import Dexie, { Table } from 'dexie';
import { toast } from 'react-toastify';

// --- INTERFACES E TIPOS --- //

type MediaType = 'image' | 'video';
type UploadStatus = 'pending' | 'uploading';

export interface IUploadQueueItem {
  id?: number;
  file: ArrayBuffer;             // guardamos como ArrayBuffer para melhor compatibilidade
  type: MediaType;
  name: string;
  size: number;
  status: UploadStatus;
  createdAt: number;
}

export interface IBudgetItem {
  id: string;
  name: string;
  currentBudget: number;
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

export const db = new AppDB();

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
      await db.uploadQueue.update(id, { status: 'pending' });
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
  form.append('source', blob, name);
  form.append('name', name);

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/adimages`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

async function uploadVideoToMeta(name: string, size: number, buffer: ArrayBuffer) {
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('access_token', ACCESS_TOKEN);
  form.append('source', blob, name);
  form.append('name', name);
  form.append('upload_phase', 'transfer');
  form.append('file_size', size.toString());

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/advideos`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

// --- ORÇAMENTOS --- //

export async function fetchBudgetItems(): Promise<IBudgetItem[]> {
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    fields: 'id,name,daily_budget',
  });

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/campaigns?${params}`
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Erro ao buscar orçamentos');
  }

  return (json.data || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    currentBudget: Number(i.daily_budget) / 100,
  }));
}

export async function updateBudget(id: string, value: number): Promise<void> {
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('daily_budget', Math.round(value * 100).toString());

  const res = await fetch(`${META_GRAPH_API_URL}/${id}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

// --- CRIAÇÃO DE CAMPANHAS --- //

export async function createCampaign(
  name: string,
  objective: string
): Promise<string> {
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('name', name);
  form.append('objective', objective);
  form.append('status', 'PAUSED');

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/campaigns`,
    { method: 'POST', body: form }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Erro ao criar campanha');
  }
  return json.id as string;
}

export async function createAdSet(
  campaignId: string,
  audienceId: string,
  budget: { type: 'DAILY' | 'LIFETIME'; value: number }
): Promise<string> {
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('campaign_id', campaignId);
  form.append(
    'promoted_object',
    JSON.stringify({ custom_audience_id: audienceId })
  );
  if (budget.type === 'DAILY') {
    form.append('daily_budget', Math.round(budget.value * 100).toString());
  } else {
    form.append('lifetime_budget', Math.round(budget.value * 100).toString());
  }

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/adsets`,
    { method: 'POST', body: form }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Erro ao criar conjunto');
  }
  return json.id as string;
}

export async function createAd(
  adSetId: string,
  message: string,
  files: File[]
): Promise<string> {
  const form = new FormData();
  form.append('access_token', ACCESS_TOKEN);
  form.append('adset_id', adSetId);
  form.append('message', message);
  if (files.length > 0) {
    form.append('source', files[0]);
  }

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/ads`,
    { method: 'POST', body: form }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Erro ao criar anúncio');
  }
  return json.id as string;
}

// --- INSIGHTS --- //

export async function getInsights(
  level: string,
  since: string,
  until: string
): Promise<any[]> {
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    level,
    time_range: JSON.stringify({ since, until }),
    fields: 'date_start,spend,clicks,actions',
  });

  const res = await fetch(
    `${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/insights?${params}`
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Erro ao obter insights');
  }
  return json.data || [];
}
