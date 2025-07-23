import React from 'react';
import useCampaignStore from '../../../stores/useCampaignStore';

const StepTargeting: React.FC = () => {
  const audienceId = useCampaignStore((s) => s.audienceId);
  const setAudienceId = useCampaignStore((s) => s.setAudienceId);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Segmentação</h2>
      <input
        type="text"
        value={audienceId}
        onChange={(e) => setAudienceId(e.target.value)}
        className="border rounded px-2 py-1"
        aria-label="Audience ID"
      />
      <div className="flex space-x-2">
        {stepIndex > 0 && (
          <button
            onClick={goBack}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Voltar
          </button>
        )}
        <button
          onClick={goNext}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default StepTargeting;
