// src/components/UploadModal.tsx

import React, {
  useState,
  useCallback,
  DragEvent,
  KeyboardEvent,
  useEffect
} from 'react';
import { enqueueMediaUpload } from '../__legacy/mediaQueue-exports';
import { toast } from 'react-toastify';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (id: number) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploaded
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fechar modal e limpar seleção
  const handleClose = useCallback(() => {
    setSelectedFiles([]);
    onClose();
  }, [onClose]);

  // Fechar com tecla Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  // Seleção via input
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles(files => [
          ...files,
          ...Array.from(e.target.files)
        ]);
      }
    },
    []
  );

  // Upload em lote
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.warn('Por favor, selecione ao menos um arquivo.');
      return;
    }

    await Promise.all(
      selectedFiles.map(file =>
        enqueueMediaUpload(file)
          .then(id => {
            toast.success(`"${file.name}" enfileirado`);
            onUploaded?.(id);
          })
          .catch(err => {
            console.error('Erro enfileirando', file.name, err);
            toast.error(`Falha ao enfileirar "${file.name}".`);
          })
      )
    );

    handleClose();
  }, [selectedFiles, onUploaded, handleClose]);

  // Drag handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      setSelectedFiles(files => [
        ...files,
        ...Array.from(e.dataTransfer.files)
      ]);
      e.dataTransfer.clearData();
    }
  }, []);

  // Limpa estado de drag se o componente desmontar
  useEffect(() => {
    return () => {
      setIsDragging(false);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Upload de Mídia</h2>
          <button
            onClick={handleClose}
            className="close-button"
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              className="file-input"
              multiple
              accept="image/jpeg,image/png,video/mp4,video/quicktime"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-input" className="file-label">
              Arraste e solte aqui ou <strong>clique para selecionar</strong>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="file-list">
              <h4>Arquivos para enviar:</h4>
              <ul>
                {selectedFiles.map((file, idx) => (
                  <li key={`${file.name}-${idx}`}>
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={handleClose}
            className="button secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            className="button primary"
            disabled={selectedFiles.length === 0}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

/* 
Adicione ao CSS global:

.modal-backdrop { /* ... igual antes ... */ }
.modal-content { /* ... */ }
/* etc */
*/
