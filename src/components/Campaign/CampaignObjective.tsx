import React from 'react';

interface CampaignObjectiveProps {
  objective: string;
  onChange: (value: string) => void;
}

const options = [
  { value: 'LINK_CLICKS', label: 'Cliques no Link' },
  { value: 'CONVERSIONS', label: 'Conversões' },
];

const CampaignObjective: React.FC<CampaignObjectiveProps> = ({
  objective,
  onChange,
}) => (
  <div className="p-4 border rounded space-y-4">
    <h3 className="text-lg font-bold">Objetivo</h3>
    <div className="flex space-x-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center space-x-1">
          <input
            type="radio"
            value={opt.value}
            checked={objective === opt.value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default CampaignObjective;
