// src/components/UploadQueue.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { liveQuery } from 'dexie';
import { toast } from 'react-toastify';
import {
  db,
  processUploadQueue,
  enqueueMediaUpload,
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
    <div className="upload-queue">
      <div className="queue-header">
        <h2>Fila de Upload</h2>
        <button
          onClick={handleProcessQueue}
          className="button primary"
          disabled={!hasPendingOrFailed}
          aria-disabled={!hasPendingOrFailed}
        >
          Publicar Mudanças
        </button>
      </div>

      {items.length > 0 ? (
        <table className="queue-list">
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
              <tr key={item.id} className={`queue-item status-${item.status}`}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                </td>
                <td className="actions-cell">
                  {item.status === 'failed' && (
                    <button
                      onClick={handleRetryItem}
                      className="action-button retry"
                    >
                      Reenviar
                    </button>
                  )}
                  {(item.status === 'pending' || item.status === 'failed') && (
                    <button
                      onClick={() => handleCancelItem(item.id)}
                      className="action-button cancel"
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
