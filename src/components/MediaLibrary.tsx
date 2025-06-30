import React, { useEffect, useState, useMemo } from 'react';
import { liveQuery } from 'dexie';
import { toast } from 'react-toastify';
import { db, IUploadQueueItem } from '../mediaQueue';

// Tipo para controlar o filtro de mídia visível.
type Filter = 'all' | 'image' | 'video';

/**
 * MediaLibrary
 * Exibe uma galeria de mídias (imagens e vídeos) a partir do IndexedDB,
 * com filtro por tipo e atualização reativa.
 */
const MediaLibrary: React.FC = () => {
  const [items, setItems] = useState<IUploadQueueItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Usa liveQuery do Dexie para reagir a qualquer mudança na tabela uploadQueue
  useEffect(() => {
    const subscription = liveQuery(() => db.uploadQueue.toArray()).subscribe({
      next(all) {
        setItems(all);
        setLoading(false);
      },
      error(err) {
        console.error('Erro no liveQuery:', err);
        toast.error('Não foi possível carregar a biblioteca de mídia.');
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Filtra os itens de acordo com o filtro selecionado
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(item => item.type === filter);
  }, [items, filter]);

  return (
    <div className="media-library-container">
      <fieldset className="filter-controls">
        <legend>Filtrar por tipo de mídia</legend>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          <option value="all">Todos</option>
          <option value="image">Imagens</option>
          <option value="video">Vídeos</option>
        </select>
      </fieldset>

      {loading ? (
        <p>Carregando biblioteca de mídia...</p>
      ) : filteredItems.length > 0 ? (
        <div className="media-grid">
          {filteredItems.map(item => (
            <MediaItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p>Nenhum item encontrado para o filtro selecionado.</p>
      )}
    </div>
  );
};

// Subcomponente para cada item de mídia
const MediaItem: React.FC<{ item: IUploadQueueItem }> = ({ item }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(new Blob([item.file]));
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [item.file]);

  return (
    <div className="media-item">
      {objectUrl && item.type === 'image' && (
        <img
          src={objectUrl}
          alt={item.name}
          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        />
      )}
      {objectUrl && item.type === 'video' && (
        <video controls style={{ width: '100%', height: 'auto' }}>
          <source src={objectUrl} type={item.file.type} />
          Seu navegador não suporta vídeo.
        </video>
      )}
      <div className="media-info">
        <p className="media-name" title={item.name}>{item.name}</p>
        <span className={`status-badge ${item.status}`}>
          {item.status}
        </span>
      </div>
    </div>
  );
};

export default MediaLibrary;

/*
----- CSS sugerido -----
.media-library-container {
  padding: 1rem;
  font-family: sans-serif;
}
.filter-controls {
  margin-bottom: 1rem;
}
.filter-controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}
.media-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.media-info {
  padding: 0.75rem;
}
.media-name {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 0.5rem 0;
}
.status-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 12px;
  text-transform: capitalize;
}
.status-badge.pending { color: #555; background-color: #f0f0f0; }
.status-badge.uploading { color: #00529B; background-color: #BDE5F8; }
*/
