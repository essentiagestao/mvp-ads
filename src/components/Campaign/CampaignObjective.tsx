import React from 'react';

type Props = {
  objective: string;
};

const CampaignObjective: React.FC<Props> = ({ objective }) => {
  return <span className="font-medium">Objetivo: {objective}</span>;
};

export default CampaignObjective;
