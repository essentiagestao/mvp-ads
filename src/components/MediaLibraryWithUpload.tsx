import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { liveQuery } from 'dexie';
import { toast } from 'react-toastify';
import { db, IUploadQueueItem } from './mediaQueue';
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Biblioteca de Mídia</h1>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Upload de Mídia
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="font-medium">Filtrar por</legend>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as Filter)}
          className="border rounded px-2 py-1"
        >
          <option value="all">Todos</option>
          <option value="image">Imagens</option>
          <option value="video">Vídeos</option>
        </select>
      </fieldset>

      {loading ? (
        <p>Carregando...</p>
      ) : filtered.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
