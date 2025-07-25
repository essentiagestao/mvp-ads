import React, { useState } from 'react';
import useCampaignStore from '../stores/useCampaignStore';
import { createCampaign } from '../services/campaign';

const StepPreview: React.FC = () => {
  const budgetType = useCampaignStore((s) => s.budgetType);
  const budgetAmount = useCampaignStore((s) => s.budgetAmount);
  const startDate = useCampaignStore((s) => s.startDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const audience = useCampaignStore((s) => s.audience);
  const name = useCampaignStore((s) => s.name);
  const goBack = useCampaignStore((s) => s.goBack);
  const setStep = useCampaignStore((s) => s.setStep);
  const resetCampaign = useCampaignStore((s) => s.resetCampaign);
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    const campaign = { budgetType, budgetAmount, startDate, endDate, audience, name };
    const success = await createCampaign(campaign as any);
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
    <div className="space-y-6 max-w-[720px] mx-auto px-4">
      <h2 className="text-lg font-bold">Revise sua campanha</h2>
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Investimento</h3>
          <p>Tipo: {budgetType === 'daily' ? 'Diário' : 'Total'}</p>
          <p>Valor: R$ {budgetAmount}</p>
        </div>
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Público</h3>
          <p>Nome: {audience.name}</p>
          <p>Localização: {audience.location}</p>
          <p>Interesses: {audience.interests}</p>
          <p>
            Idade: {audience.ageMin} - {audience.ageMax}
          </p>
          <p>Usar salvo: {audience.useSaved ? 'Sim' : 'Não'}</p>
        </div>
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Datas</h3>
          <p>Início: {startDate}</p>
          <p>Término: {endDate}</p>
        </div>
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Conteúdo</h3>
          <p>{name}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setStep('budget')}
          className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
        >
          Editar campanha
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
