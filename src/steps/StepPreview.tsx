import React, { useState } from 'react';
import useCampaignStore from '../stores/useCampaignStore';
import { createCampaign } from '../services/campaign';

const StepPreview: React.FC = () => {
  const budgetType = useCampaignStore((s) => s.budgetType);
  const budgetAmount = useCampaignStore((s) => s.budgetAmount);
  const startDate = useCampaignStore((s) => s.startDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const audienceId = useCampaignStore((s) => s.audienceId);
  const name = useCampaignStore((s) => s.name);
  const goBack = useCampaignStore((s) => s.goBack);
  const resetCampaign = useCampaignStore((s) => s.resetCampaign);
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    const campaign = { budgetType, budgetAmount, startDate, endDate, audienceId, name };
    const success = await createCampaign(campaign);
    setLoading(false);
    if (success) {
      setCreated(true);
    } else {
      setError('Falha ao criar campanha.');
    }
  };

  const handleNewCampaign = () => {
    resetCampaign();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Revise sua campanha</h2>
      <ul className="space-y-1">
        <li>Nome: {name}</li>
        <li>Tipo de orçamento: {budgetType === 'daily' ? 'Diário' : 'Total'}</li>
        <li>Investimento: {budgetAmount}</li>
        <li>Data de início: {startDate}</li>
        <li>Data de término: {endDate}</li>
        <li>ID de público: {audienceId}</li>
      </ul>
      <div className="flex space-x-2">
        <button
          onClick={goBack}
          className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
        >
          Voltar
        </button>
        {!created ? (
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded border text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
          >
            {loading ? 'Confirmando...' : 'Confirmar e Criar Campanha'}
          </button>
        ) : (
          <button
            onClick={handleNewCampaign}
            className="px-4 py-2 rounded border bg-green-600 text-white hover:bg-green-700"
          >
            Criar nova campanha
          </button>
        )}
      </div>
      {error && <p className="text-red-500" role="alert">{error}</p>}
      {created && <p>Campanha criada com sucesso!</p>}
    </div>
  );
};

export default StepPreview;
