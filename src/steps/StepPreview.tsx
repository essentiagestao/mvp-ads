import React, { useState } from 'react';
import useCampaignStore from '../stores/useCampaignStore';
import { createCampaign } from '../services/campaign';

const StepPreview: React.FC = () => {
  const budgetType = useCampaignStore((s) => s.budgetType);
  const budgetAmount = useCampaignStore((s) => s.budgetAmount);
  const startDate = useCampaignStore((s) => s.startDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const audienceId = useCampaignStore((s) => s.audienceId);
  const goBack = useCampaignStore((s) => s.goBack);
  const resetCampaign = useCampaignStore((s) => s.resetCampaign);
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const campaign = { budgetType, budgetAmount, startDate, endDate, audienceId };
    const success = await createCampaign(campaign);
    setLoading(false);
    if (success) {
      setCreated(true);
    }
  };

  const handleNewCampaign = () => {
    resetCampaign();
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
        {!created ? (
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Confirmar e Criar Campanha
          </button>
        ) : (
          <button
            onClick={handleNewCampaign}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Criar nova campanha
          </button>
        )}
      </div>
      {created && <p>Campanha criada com sucesso!</p>}
    </div>
  );
};

export default StepPreview;
