import React from 'react';
import PageSelector from './PageSelector';

export interface CampaignCreativeValues {
  files: File[];
  message: string;
  link: string;
  page: string;
}

interface CampaignCreativeProps extends CampaignCreativeValues {
  onChange: (values: CampaignCreativeValues) => void;
}

const CampaignCreative: React.FC<CampaignCreativeProps> = ({
  files,
  message,
  link,
  page,
  onChange,
}) => {
  const handleChange = (
    field: keyof CampaignCreativeValues,
    value: string | File[]
  ) => {
    const next: CampaignCreativeValues = { files, message, link, page, [field]: value } as CampaignCreativeValues;
    onChange(next);
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    handleChange('files', selected);
  };

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="text-lg font-bold">Criativo</h3>
      <div>
        <label className="block mb-1 font-medium" htmlFor="files">
          Mídia
        </label>
        <input id="files" type="file" multiple onChange={onFilesChange} />
        {files.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {files.length} arquivo(s) selecionado(s)
          </p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium" htmlFor="message">
          Mensagem
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => handleChange('message', e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium" htmlFor="link">
          Link
        </label>
        <input
          id="link"
          type="url"
          value={link}
          onChange={(e) => handleChange('link', e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <PageSelector
        selectedPage={page}
        onChange={(p) => handleChange('page', p)}
      />
    </div>
  );
};

export default CampaignCreative;
