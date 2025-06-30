// Importando as dependências necessárias
import Dexie, { Table } from 'dexie';
import { toast } from 'react-toastify';

// --- INTERFACES E TIPOS --- //

// Define o tipo de mídia para garantir consistência.
type MediaType = 'image' | 'video';

// Define o status do upload para controlar o fluxo do processo.
type UploadStatus = 'pending' | 'uploading';

// Define a estrutura de um item na fila de upload.
export interface IUploadQueueItem {
  id?: number; // Chave primária, autoincrementada pelo Dexie
  file: Blob; // O arquivo de mídia em si
  type: MediaType;
  name: string; // Nome do arquivo para referência do usuário
  size: number; // Tamanho do arquivo em bytes
  status: UploadStatus;
  createdAt: number; // Timestamp da criação para possível depuração
}

// --- CONFIGURAÇÃO DO BANCO DE DADOS (DEXIE.JS) --- //

/**
 * Classe que estende o Dexie para definir nosso banco de dados.
 * O Dexie é um wrapper minimalista para IndexedDB que simplifica muito a interação.
 */
class AppDB extends Dexie {
  // A propriedade 'uploadQueue' representa nossa tabela no IndexedDB.
  // A tipagem garante que só poderemos adicionar objetos que seguem a interface IUploadQueueItem.
  uploadQueue!: Table<IUploadQueueItem>;

  constructor() {
    super('AppDB'); // Nome do banco de dados
    this.version(1).stores({
      // Definimos o schema da tabela 'uploadQueue'.
      // '++id' indica que 'id' é a chave primária e será autoincrementada.
      // 'status' é um índice, o que otimiza consultas por este campo.
      uploadQueue: '++id, status',
    });
  }
}

// Instancia o banco de dados para ser usado em toda a aplicação.
const db = new AppDB();

// --- CONSTANTES DA API --- //
// Substitua pelos seus valores reais
const YOUR_AD_ACCOUNT_ID = 'act_YOUR_AD_ACCOUNT_ID';
const YOUR_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
const META_GRAPH_API_URL = 'https://graph.facebook.com/v20.0';


// --- FUNÇÕES PRINCIPAIS --- //

/**
 * Adiciona um arquivo de mídia à fila de uploads no IndexedDB.
 * @param file - O objeto File vindo de um input <input type="file" />.
 * @returns Uma Promise que resolve com o ID do item recém-adicionado na fila.
 */
export async function enqueueMediaUpload(file: File): Promise<number> {
  // Determina o tipo de mídia com base no MIME type do arquivo.
  const type: MediaType = file.type.startsWith('image/') ? 'image' : 'video';

  console.log(`Enfileirando arquivo: ${file.name}, Tipo: ${type}`);

  // Adiciona o novo item à tabela 'uploadQueue' com o status 'pending'.
  // O Dexie lida com a transação de forma transparente.
  const id = await db.uploadQueue.add({
    file,
    type,
    name: file.name,
    size: file.size,
    status: 'pending',
    createdAt: Date.now(),
  });

  // Retorna o ID do item inserido para referência futura.
  return id;
}

/**
 * Processa a fila de uploads, enviando os itens pendentes para a API da Meta.
 * Esta função é o coração do sistema de upload.
 */
export async function processUploadQueue(): Promise<void> {
  // 1. Verifica a Conexão
  // Se o navegador indicar que está offline, notifica o usuário e interrompe o processo.
  if (!navigator.onLine) {
    toast.info('Offline: O upload ficará em fila para ser enviado quando houver conexão.');
    return;
  }

  // 2. Busca Itens Pendentes
  // Consulta o banco de dados por todos os itens cujo status seja 'pending'.
  const pendingItems = await db.uploadQueue.where('status').equals('pending').toArray();

  if (pendingItems.length === 0) {
    console.log('Fila de upload vazia. Nada a processar.');
    return;
  }

  console.log(`Iniciando processamento de ${pendingItems.length} item(ns) na fila.`);

  // 3. Processa cada item individualmente
  for (const item of pendingItems) {
    // Garante que o item tenha um ID, o que é esperado do Dexie.
    if (!item.id) continue;

    const currentItemId = item.id;

    try {
      // 3.1. Marca como "uploading" para evitar reprocessamento
      // Atualiza o status no banco de dados para 'uploading'. Isso previne que outra
      // chamada a `processUploadQueue` tente enviar o mesmo arquivo simultaneamente.
      await db.uploadQueue.update(currentItemId, { status: 'uploading' });

      let uploadResult;
      // 3.2. Executa o upload específico por tipo
      if (item.type === 'image') {
        uploadResult = await uploadImageToMeta(item.name, item.file);
      } else {
        uploadResult = await uploadVideoToMeta(item.name, item.size, item.file);
      }

      console.log(`Upload bem-sucedido para ${item.name}:`, uploadResult);

      // 3.3. Sucesso: Remove da fila
      // Se o upload foi bem-sucedido, o item é removido permanentemente da fila.
      await db.uploadQueue.delete(currentItemId);
      toast.success(`Upload de "${item.name}" concluído com sucesso!`);

    } catch (error) {
      // 3.4. Erro: Volta para "pending"
      console.error(`Falha no upload do item ${currentItemId} (${item.name}):`, error);
      
      // Se ocorrer um erro, o status do item é revertido para 'pending'.
      // Isso permite que o sistema tente fazer o upload novamente na próxima vez que `processUploadQueue` for chamada.
      await db.uploadQueue.update(currentItemId, { status: 'pending' });
      toast.error(`Erro no upload de "${item.name}". Tentaremos novamente.`);
    }
  }
}

// --- FUNÇÕES AUXILIARES DE UPLOAD (API da Meta) --- //

/**
 * Faz o upload de uma imagem para a conta de anúncios da Meta.
 * @param name - Nome do arquivo para referência.
 * @param file - O Blob do arquivo de imagem.
 */
async function uploadImageToMeta(name: string, file: Blob) {
    const formData = new FormData();
    formData.append('access_token', YOUR_ACCESS_TOKEN);
    formData.append('name', name);
    formData.append('source', file);

    const response = await fetch(`${META_GRAPH_API_URL}/${YOUR_AD_ACCOUNT_ID}/adimages`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Falha ao fazer upload da imagem.');
    }
    return data;
}

/**
 * Executa o upload de um vídeo em três fases para a conta de anúncios da Meta (start, transfer, finish).
 * @param name - Nome do arquivo para referência.
 * @param fileSize - Tamanho total do arquivo.
 * @param file - O Blob do arquivo de vídeo.
 */
async function uploadVideoToMeta(name: string, fileSize: number, file: Blob) {
    // --- FASE 1: START ---
    // Inicia a sessão de upload e obtém a URL de upload e o ID da sessão.
    console.log(`[Vídeo: ${name}] Fase 1: Iniciando upload.`);
    const startResponse = await fetch(`${META_GRAPH_API_URL}/${YOUR_AD_ACCOUNT_ID}/advideos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            upload_phase: 'start',
            access_token: YOUR_ACCESS_TOKEN,
            file_size: fileSize,
        }),
    });
    const startData = await startResponse.json();
    if (!startResponse.ok || startData.error) {
        throw new Error(startData.error?.message || 'Falha na fase START do upload de vídeo.');
    }

    const { upload_session_id, upload_url } = startData;
    console.log(`[Vídeo: ${name}] Fase 1 completa. Session ID: ${upload_session_id}`);

    // --- FASE 2: TRANSFER ---
    // Envia o conteúdo binário do arquivo para a URL de upload fornecida.
    console.log(`[Vídeo: ${name}] Fase 2: Transferindo arquivo...`);
    const transferResponse = await fetch(upload_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(fileSize),
        },
        body: file,
    });
    const transferData = await transferResponse.json();
    if (!transferResponse.ok || transferData.error) {
        throw new Error(transferData.error?.message || 'Falha na fase TRANSFER do upload de vídeo.');
    }
    console.log(`[Vídeo: ${name}] Fase 2 completa.`);


    // --- FASE 3: FINISH ---
    // Finaliza a sessão de upload, informando à Meta que a transferência terminou.
    console.log(`[Vídeo: ${name}] Fase 3: Finalizando upload.`);
    const finishResponse = await fetch(`${META_GRAPH_API_URL}/${YOUR_AD_ACCOUNT_ID}/advideos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            upload_phase: 'finish',
            access_token: YOUR_ACCESS_TOKEN,
            upload_session_id: upload_session_id,
            name: name, // Opcional: pode definir o nome aqui também
        }),
    });

    const finishData = await finishResponse.json();
    if (!finishResponse.ok || finishData.error) {
        throw new Error(finishData.error?.message || 'Falha na fase FINISH do upload de vídeo.');
    }
    console.log(`[Vídeo: ${name}] Fase 3 completa. Upload finalizado.`);

    return finishData;
}
