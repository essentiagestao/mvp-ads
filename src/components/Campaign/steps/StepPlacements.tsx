import React from 'react';
import useCampaignStore from '../../../stores/useCampaignStore';

const placementOptions = [
  'Feed',
  'Stories',
  'Marketplace',
  'Search',
];

const StepPlacements: React.FC = () => {
  const placements = useCampaignStore((s) => s.placements);
  const setPlacements = useCampaignStore((s) => s.setPlacements);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  const togglePlacement = (p: string) => {
    const next = placements.includes(p)
      ? placements.filter((pl) => pl !== p)
      : [...placements, p];
    setPlacements(next);
  };

  return (
    <div className="space-y-6 max-w-[720px] mx-auto px-4">
      <h2 className="text-lg font-bold">Posicionamentos</h2>
      <div className="grid grid-cols-2 gap-2">
        {placementOptions.map((p) => (
          <label key={p} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={placements.includes(p)}
              onChange={() => togglePlacement(p)}
            />
            <span>{p}</span>
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

export default StepPlacements;
