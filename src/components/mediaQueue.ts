// src/mediaQueue.ts

import Dexie, { Table } from 'dexie';
import { toast } from 'react-toastify';
import { mockApi } from '../mocks/handlers';

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

interface IInsightRow {
  id?: number;
  level: string;
  since: string;
  until: string;
  data: any[];
}

class AppDB extends Dexie {
  uploadQueue!: Table<IUploadQueueItem>;
  budgetItems!: Table<IBudgetItem, string>;
  insights!: Table<IInsightRow>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      uploadQueue: '++id, status',
      budgetItems: 'id',
      insights: '++id,[level+since+until]'
    });

    this.on('populate', () => {
      this.budgetItems.bulkAdd([
        { id: '1', name: 'Item 1', currentBudget: 10 },
        { id: '2', name: 'Item 2', currentBudget: 20 },
        { id: '3', name: 'Item 3', currentBudget: 30 }
      ]);
    });
  }
}

const db = new AppDB();

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
    const { id, file, name } = item;

    try {
      await db.uploadQueue.update(id, { status: 'uploading' });

      const form = new FormData();
      const blob = new Blob([file]);
      form.append('file', blob, name);

      const res = await fetch('/upload', { method: 'POST', body: form });

      if (!res.ok) {
        throw new Error('Upload failed');
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
// Mantido apenas para compatibilidade com módulos legados

// --- TIPOS E FUNÇÕES DA API --- //

export interface IBudgetItem {
  id: string;
  name: string;
  currentBudget: number;
}

export async function fetchBudgetItems(): Promise<IBudgetItem[]> {
  return db.budgetItems.toArray();
}

export async function updateBudget(
  id: string,
  value: number
): Promise<void> {
  await db.budgetItems.update(id, { currentBudget: value });
}

export async function createCampaign(
  name: string,
  objective: string
): Promise<string> {
  const { id } = await mockApi.createCampaign();
  return id;
}

export async function createAdSet(
  campaignId: string,
  audienceId: string,
  budget: { type: 'DAILY' | 'LIFETIME'; value: number }
): Promise<string> {
  const { id } = await mockApi.createAdSet();
  return id;
}

export async function createAd(
  adSetId: string,
  message: string,
  files: File[]
): Promise<string> {
  const { id } = await mockApi.createAd();
  return id;
}

export async function getInsights(
  level: string,
  since: string,
  until: string
): Promise<any[]> {
  const key = [level, since, until];

  const fetchAndCache = async () => {
    const params = new URLSearchParams({ level, since, until });
    const res = await fetch(`/insights?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch insights');
    const data = await res.json();
    await db.insights.put({ level, since, until, data });
    return data;
  };

  if (navigator.onLine) {
    try {
      return await fetchAndCache();
    } catch (err) {
      console.error(err);
    }
  }

  const cached = await db.insights
    .where(['level', 'since', 'until'])
    .equals(key)
    .first();
  return cached?.data ?? [];
}

export { db };
