import React from 'react';
import useCampaignStore from '../stores/useCampaignStore';
import { createCampaign } from '../services/campaign';

const StepPreview: React.FC = () => {
  const budgetType = useCampaignStore((s) => s.budgetType);
  const budgetAmount = useCampaignStore((s) => s.budgetAmount);
  const startDate = useCampaignStore((s) => s.startDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const audienceId = useCampaignStore((s) => s.audienceId);
  const goBack = useCampaignStore((s) => s.goBack);

  const handleConfirm = async () => {
    const campaign = { budgetType, budgetAmount, startDate, endDate, audienceId };
    await createCampaign(campaign);
    console.log(campaign);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Revise sua campanha</h2>
      <ul className="space-y-1">
        <li>Tipo de orçamento: {budgetType === 'daily' ? 'Diário' : 'Total'}</li>
        <li>Valor do orçamento: {budgetAmount}</li>
        <li>Data de início: {startDate}</li>
        <li>Data de término: {endDate}</li>
        <li>ID de público: {audienceId}</li>
      </ul>
      <div className="flex space-x-2">
        <button
          onClick={goBack}
          className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
        >
          Voltar
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Confirmar e Criar Campanha
        </button>
      </div>
    </div>
  );
};

export default StepPreview;
