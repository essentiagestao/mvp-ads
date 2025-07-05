import React, {
  useState, useEffect, useMemo, useCallback, DragEvent
} from 'react';
import { liveQuery } from 'dexie';
import { toast } from 'react-toastify';
import { db, IUploadQueueItem, enqueueMediaUpload } from './mediaQueue';
import MediaItem from './MediaItem';
import UploadModal from './UploadModal';

type Filter = 'all' | 'image' | 'video';

const MediaLibraryWithUpload: React.FC = () => {
  const [items, setItems] = useState<IUploadQueueItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Carrega e atualiza ao vivo
  useEffect(() => {
    const sub = liveQuery(() => db.uploadQueue.toArray()).subscribe({
      next(all) { setItems(all); setLoading(false); },
      error() { toast.error('Erro ao carregar mídia'); setLoading(false); }
    });
    return () => sub.unsubscribe();
  }, []);

  const filtered = useMemo(
    () => filter==='all' ? items : items.filter(i=>i.type===filter),
    [items, filter]
  );

  const handleEnqueued = useCallback((id:number) => {
    toast.info(`Item enfileirado (ID ${id})`);
  }, []);

  return (
    <div className="media-page-container">
      <div className="page-header">
        <h1>Biblioteca de Mídia</h1>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="button primary"
        >
          Upload de Mídia
        </button>
      </div>

      <fieldset className="filter-controls">
        <legend>Filtrar por</legend>
        <select value={filter} onChange={e => setFilter(e.target.value as Filter)}>
          <option value="all">Todos</option>
          <option value="image">Imagens</option>
          <option value="video">Vídeos</option>
        </select>
      </fieldset>

      {loading ? (
        <p>Carregando...</p>
      ) : filtered.length ? (
        <div className="media-grid">
          {filtered.map(item =>
            <MediaItem key={item.id} item={item} />
          )}
        </div>
      ) : (
        <p>Nenhum item encontrado.</p>
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handleEnqueued}
      />
    </div>
  );
};

// ... inclua aqui os subcomponentes MediaItem e UploadModal
// mas sem mocks, apenas consumindo enqueueMediaUpload e db

export default MediaLibraryWithUpload;
