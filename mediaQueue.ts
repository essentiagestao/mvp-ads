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
  form.append('name', name);
  form.append('source', blob);
  const res = await fetch(`${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/adimages`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Erro ao enviar imagem');
  }
  return data;
}

async function uploadVideoToMeta(
  name: string,
  fileSize: number,
  buffer: ArrayBuffer
) {
  const startRes = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/advideos`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'start',
        access_token: ACCESS_TOKEN,
        file_size: fileSize
      })
    }
  );
  const start = await startRes.json();
  if (!startRes.ok || start.error) {
    throw new Error(start.error?.message || 'Falha ao iniciar upload de vídeo');
  }

  const uploadUrl = start.upload_url as string;
  const sessionId = start.upload_session_id as string;

  const transferRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: buffer
  });
  if (!transferRes.ok) {
    throw new Error('Falha ao transferir vídeo');
  }

  const finishRes = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/advideos`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'finish',
        access_token: ACCESS_TOKEN,
        upload_session_id: sessionId,
        name
      })
    }
  );
  const finish = await finishRes.json();
  if (!finishRes.ok || finish.error) {
    throw new Error(finish.error?.message || 'Falha ao finalizar upload');
  }
  return finish;
}

// --- OUTRAS FUNÇÕES UTILIZADAS PELAS TELAS --- //
export interface IBudgetItem {
  id: string;
  name: string;
  currentBudget: number;
}

export async function fetchBudgetItems(): Promise<IBudgetItem[]> {
  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/campaigns?fields=name,daily_budget&access_token=${ACCESS_TOKEN}`
  );
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || 'Erro ao buscar orçamentos');
  }
  return (json.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    currentBudget: parseFloat(c.daily_budget) / 100
  }));
}

export async function updateBudget(id: string, value: number): Promise<void> {
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('daily_budget', String(Math.round(value * 100)));
  const res = await fetch(`${META_GRAPH_API_URL}/${id}`, {
    method: 'POST',
    body: form
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || 'Erro ao atualizar orçamento');
  }
}

export async function createCampaign(
  name: string,
  objective: string
): Promise<string> {
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('name', name);
  form.append('objective', objective);
  const res = await fetch(`${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/campaigns`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Erro ao criar campanha');
  }
  return data.id as string;
}

export async function createAdSet(
  campaignId: string,
  audienceId: string,
  budget: { type: string; value: number }
): Promise<string> {
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('campaign_id', campaignId);
  form.append('targeting', JSON.stringify({ custom_audiences: [{ id: audienceId }] }));
  if (budget.type === 'DAILY') {
    form.append('daily_budget', String(Math.round(budget.value * 100)));
  } else {
    form.append('lifetime_budget', String(Math.round(budget.value * 100)));
  }
  const res = await fetch(`${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/adsets`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Erro ao criar conjunto');
  }
  return data.id as string;
}

export async function createAd(
  adSetId: string,
  message: string,
  files: File[]
): Promise<string> {
  const imageIds: string[] = [];
  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const res = await uploadImageToMeta(file.name, buffer);
    imageIds.push(res.hash || res.id);
  }
  const form = new URLSearchParams();
  form.append('access_token', ACCESS_TOKEN);
  form.append('adset_id', adSetId);
  if (imageIds.length > 0) {
    form.append('creative', JSON.stringify({ image_hash: imageIds[0] }));
  }
  form.append('name', message);
  const res = await fetch(`${META_GRAPH_API_URL}/act_${AD_ACCOUNT_ID}/ads`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Erro ao criar anúncio');
  }
  return data.id as string;
}

export async function getInsights(
  level: string,
  since: string,
  until: string
) {
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    level,
    time_range: JSON.stringify({ since, until }),
    fields: 'date_start,spend,clicks,actions'
  });
  const res = await fetch(
    `${META_GRAPH_API_URL}/${AD_ACCOUNT_ID}/insights?${params.toString()}`
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Erro ao obter insights');
  }
  return data.data as any[];
}
