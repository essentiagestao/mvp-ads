import React from 'react';
import useCampaignStore from '../../../stores/useCampaignStore';

const StepTargeting: React.FC = () => {
  const audience = useCampaignStore((s) => s.audience);
  const setAudience = useCampaignStore((s) => s.setAudience);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  return (
    <div className="space-y-6 max-w-[720px] mx-auto px-4">
      <h2 className="text-lg font-bold">Público</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="audienceName">
            Nome do Público
          </label>
          <input
            id="audienceName"
            type="text"
            value={audience.name}
            onChange={(e) => setAudience({ ...audience, name: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="location">
            Localização
          </label>
          <input
            id="location"
            type="text"
            value={audience.location}
            onChange={(e) => setAudience({ ...audience, location: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="interests">
            Interesses
          </label>
          <textarea
            id="interests"
            value={audience.interests}
            onChange={(e) => setAudience({ ...audience, interests: e.target.value })}
            className="border rounded px-2 py-1 w-full"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="ageMin">
              Idade mínima
            </label>
            <input
              id="ageMin"
              type="number"
              min={0}
              value={audience.ageMin}
              onChange={(e) => setAudience({ ...audience, ageMin: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="ageMax">
              Idade máxima
            </label>
            <input
              id="ageMax"
              type="number"
              min={0}
              value={audience.ageMax}
              onChange={(e) => setAudience({ ...audience, ageMax: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={audience.useSaved}
            onChange={(e) => setAudience({ ...audience, useSaved: e.target.checked })}
          />
          Usar público salvo
        </label>
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

export default StepTargeting;
