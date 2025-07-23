import React from 'react';
import { CampaignValues } from '../../stores/useCampaignStore';

interface CampaignSummaryProps extends CampaignValues {}

const CampaignSummary: React.FC<CampaignSummaryProps> = ({
  objective,
  audienceId,
  budgetType,
  budgetAmount,
  startDate,
  endDate,
  creative,
  targeting,
  placements,
  media,
}) => {
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '');

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="text-lg font-bold">Resumo</h3>
      <div>
        <strong>Objetivo:</strong> {objective || '-'}
      </div>
      <div>
        <strong>Público:</strong> {audienceId || '-'}
      </div>
      <div>
        <strong>Orçamento:</strong> {budgetType} - R${budgetAmount}
      </div>
      <div>
        <strong>Data de início:</strong> {formatDate(startDate)}
      </div>
      <div>
        <strong>Data de término:</strong> {formatDate(endDate)}
      </div>
      <div>
        <strong>Criativo:</strong>
        <div className="ml-2">
          <div>
            <strong>Mensagem:</strong> {creative.message || '-'}
          </div>
          <div>
            <strong>Link:</strong> {creative.link || '-'}
          </div>
          <div>
            <strong>Página:</strong> {creative.page || '-'}
          </div>
          {creative.files.length > 0 && (
            <ul className="list-disc list-inside">
              {creative.files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {targeting && (
        <div>
          <strong>Targeting:</strong>{' '}
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(targeting, null, 2)}
          </pre>
        </div>
      )}
      {placements.length > 0 && (
        <div>
          <strong>Placements:</strong> {placements.join(', ')}
        </div>
      )}
      {media.length > 0 && (
        <div>
          <strong>Media:</strong> {media.length} arquivo(s)
        </div>
      )}
    </div>
  );
};

export default CampaignSummary;
