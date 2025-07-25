import React, { useMemo } from 'react';
import useCampaignStore, { CampaignCreativeValues } from '../../../stores/useCampaignStore';

const StepContent: React.FC = () => {
  const creative = useCampaignStore((s) => s.creative);
  const name = useCampaignStore((s) => s.name);
  const setCreative = useCampaignStore((s) => s.setCreative);
  const setName = useCampaignStore((s) => s.setName);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  const handleChange = (
    field: keyof CampaignCreativeValues,
    value: string | File[],
  ) => {
    setCreative({ ...creative, [field]: value } as CampaignCreativeValues);
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleChange('files', files);
  };

  const previewUrl = useMemo(() => {
    if (creative.files && creative.files.length > 0) {
      return URL.createObjectURL(creative.files[0]);
    }
    return creative.link;
  }, [creative.files, creative.link]);

  return (
    <div className="space-y-6 max-w-[720px] mx-auto px-4">
      <h2 className="text-lg font-bold">Conteúdo</h2>
      <div>
        <label className="block mb-1 font-medium" htmlFor="campaignName">
          Nome da campanha
        </label>
        <input
          id="campaignName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          aria-label="Nome da campanha"
        />
      </div>
      <div className="space-y-4">
        <label className="block mb-1 font-medium" htmlFor="imageUpload">
          Imagem do anúncio
        </label>
        <input id="imageUpload" type="file" onChange={onFilesChange} />
        <div>
          <label className="block mb-1 font-medium" htmlFor="imageUrl">
            ou informe a URL da imagem
          </label>
          <input
            id="imageUrl"
            type="text"
            value={creative.link}
            onChange={(e) => handleChange('link', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        {previewUrl && (
          <div className="border rounded p-2 w-full max-w-[320px]">
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="object-contain max-h-[320px] mx-auto"
            />
          </div>
        )}
      </div>
      <label className="block mb-1 font-medium" htmlFor="message">
        Texto principal do anúncio
      </label>
      <textarea
        id="message"
        value={creative.message}
        onChange={(e) => handleChange('message', e.target.value)}
        className="border rounded px-2 py-1 w-full"
        rows={4}
        aria-label="Texto principal do anúncio"
      />
      <div>
        <label className="block mb-1 font-medium" htmlFor="destination">
          Link de destino
        </label>
        <input
          id="destination"
          type="text"
          value={creative.page}
          onChange={(e) => handleChange('page', e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="flex space-x-2">
        {stepIndex > 0 && (
          <button
          onClick={goBack}
          className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
        >
          Voltar
        </button>
      )}
      <button
        onClick={goNext}
        className="px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700"
      >
        Próximo
      </button>
      </div>
    </div>
  );
};

export default StepContent;
