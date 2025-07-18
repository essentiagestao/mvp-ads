import React from 'react';

interface CampaignAudienceProps {
  audienceId: string;
  onChange: (audienceId: string) => void;
}

const CampaignAudience: React.FC<CampaignAudienceProps> = ({ audienceId, onChange }) => (
  <div className="p-4 border rounded space-y-4">
    <h3 className="text-lg font-bold">Público</h3>
    <div>
      <label className="block mb-1 font-medium" htmlFor="audienceId">
        Audience ID
      </label>
      <input
        id="audienceId"
        type="text"
        value={audienceId}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
    </div>
  </div>
);

export default CampaignAudience;
