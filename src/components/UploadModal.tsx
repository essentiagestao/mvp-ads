// src/components/UploadModal.tsx

import React, {
  useState,
  useCallback,
  DragEvent,
  KeyboardEvent,
  useEffect
} from 'react';
import { enqueueMediaUpload } from './mediaQueue';
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded shadow-lg p-4 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h2 className="text-lg font-bold">Upload de Mídia</h2>
          <button
            onClick={handleClose}
            className="text-xl leading-none"
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded p-4 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              className="hidden"
              multiple
              accept="image/jpeg,image/png,video/mp4,video/quicktime"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-input" className="cursor-pointer text-blue-600">
              Arraste e solte aqui ou <strong>clique para selecionar</strong>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <h4 className="font-medium">Arquivos para enviar:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {selectedFiles.map((file, idx) => (
                  <li key={`${file.name}-${idx}`}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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

// Adicione ao CSS global:
//
// .modal-backdrop { /* ... igual antes ... */ }
// .modal-content { /* ... */ }
// etc
