import React from 'react';
import useCampaignStore, { CampaignCreativeValues } from '../../../stores/useCampaignStore';

const StepContent: React.FC = () => {
  const creative = useCampaignStore((s) => s.creative);
  const name = useCampaignStore((s) => s.name);
  const setCreative = useCampaignStore((s) => s.setCreative);
  const setName = useCampaignStore((s) => s.setName);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  const handleChange = (field: keyof CampaignCreativeValues, value: string | File[]) => {
    setCreative({ ...creative, [field]: value } as CampaignCreativeValues);
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleChange('files', files);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Mídia e Conteúdo</h2>
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
      <input type="file" multiple onChange={onFilesChange} />
      <textarea
        value={creative.message}
        onChange={(e) => handleChange('message', e.target.value)}
        className="border rounded px-2 py-1 w-full"
        aria-label="Mensagem"
      />
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
