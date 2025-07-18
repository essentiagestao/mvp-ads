// src/components/UploadQueue.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { liveQuery } from 'dexie';
import { toast } from 'react-toastify';
import {
  db,
  processUploadQueue,
  IUploadQueueItem
} from './mediaQueue';

/**
 * UploadQueue
 * Exibe a fila real de uploads e permite publish/retry/cancel.
 */
const UploadQueue: React.FC = () => {
  const [items, setItems] = useState<IUploadQueueItem[]>([]);

  // Assina mudanças na tabela uploadQueue em tempo real
  useEffect(() => {
    const sub = liveQuery(() => db.uploadQueue.toArray()).subscribe({
      next(arr) { setItems(arr); },
      error(err) {
        console.error('Erro liveQuery:', err);
        toast.error('Não foi possível carregar a fila de upload.');
      }
    });
    return () => sub.unsubscribe();
  }, []);

  // Publica toda a fila
  const handleProcessQueue = useCallback(async () => {
    try {
      toast.info('Iniciando publicação das mudanças...');
      await processUploadQueue();
      toast.success('Mudanças publicadas com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao publicar mudanças.');
    }
  }, []);

  // Reenvia apenas itens que falharam (na prática reprocessa toda a fila)
  const handleRetryItem = useCallback(async () => {
    await handleProcessQueue();
  }, [handleProcessQueue]);

  // Cancela (deleta) um item da fila
  const handleCancelItem = useCallback(async (id: number) => {
    try {
      await db.uploadQueue.delete(id);
      toast.success(`Item ${id} cancelado.`);
    } catch (err) {
      console.error(err);
      toast.error(`Não foi possível cancelar o item ${id}.`);
    }
  }, []);

  const hasPendingOrFailed = items.some(i => i.status === 'pending' || i.status === 'failed');

  return (
    <div className="p-4 space-y-4 border rounded">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Fila de Upload</h2>
        <button
          onClick={handleProcessQueue}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={!hasPendingOrFailed}
          aria-disabled={!hasPendingOrFailed}
        >
          Publicar Mudanças
        </button>
      </div>

      {items.length > 0 ? (
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.status === 'uploading'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="space-x-2">
                  {item.status === 'failed' && (
                    <button
                      onClick={handleRetryItem}
                      className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Reenviar
                    </button>
                  )}
                  {(item.status === 'pending' || item.status === 'failed') && (
                    <button
                      onClick={() => handleCancelItem(item.id)}
                      className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>A fila de upload está vazia.</p>
      )}
    </div>
  );
};

export default UploadQueue;
