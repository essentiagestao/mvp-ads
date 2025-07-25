import React from 'react';
import useCampaignStore from '../../../stores/useCampaignStore';

const options = [
  { value: 'LINK_CLICKS', label: 'Cliques no Link' },
  { value: 'CONVERSIONS', label: 'Conversões' },
];

const StepObjective: React.FC = () => {
  const objective = useCampaignStore((s) => s.objective);
  const setObjective = useCampaignStore((s) => s.setObjective);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  return (
    <div className="space-y-6 max-w-[720px] mx-auto px-4">
      <h2 className="text-lg font-bold">Objetivo</h2>
      <div className="flex space-x-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <input
              type="radio"
              value={opt.value}
              checked={objective === opt.value}
              onChange={(e) => setObjective(e.target.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
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

export default StepObjective;
