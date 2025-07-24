import React, { useState } from 'react';
import useCampaignStore from '../../../stores/useCampaignStore';

const StepScheduling: React.FC = () => {
  const startDate = useCampaignStore((s) => s.startDate);
  const endDate = useCampaignStore((s) => s.endDate);
  const setStartDate = useCampaignStore((s) => s.setStartDate);
  const setEndDate = useCampaignStore((s) => s.setEndDate);
  const updateCampaign = useCampaignStore((s) => s.updateCampaign);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (startDate && endDate && endDate < startDate) {
      setError('A data de término não pode ser anterior à data de início.');
      return;
    }
    updateCampaign({ startDate, endDate });
    setError('');
    goNext();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Agendamento</h2>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border rounded px-2 py-1"
        aria-label="Data de início"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border rounded px-2 py-1"
        aria-label="Quando a campanha termina?"
      />
      {error && (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      )}
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
          onClick={handleNext}
          className="px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default StepScheduling;
