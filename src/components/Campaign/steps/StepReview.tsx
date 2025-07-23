import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import useCampaignStore, {
  selectBudgetAmount,
  selectBudgetType,
  selectStartDate,
  selectEndDate,
  selectCreative,
  selectTargeting,
  selectPlacements,
  selectMedia,
  selectObjective,
  selectAudienceId,
  selectResetCampaign,
} from '../../../stores/useCampaignStore';
import { createCampaign, createAdSet, createAd } from '../../mediaQueue';

const StepReview: React.FC = () => {
  const budgetAmount = useCampaignStore(selectBudgetAmount);
  const budgetType = useCampaignStore(selectBudgetType);
  const startDate = useCampaignStore(selectStartDate);
  const endDate = useCampaignStore(selectEndDate);
  const creative = useCampaignStore(selectCreative);
  const targeting = useCampaignStore(selectTargeting);
  const placements = useCampaignStore(selectPlacements);
  const media = useCampaignStore(selectMedia);
  const objective = useCampaignStore(selectObjective);
  const audienceId = useCampaignStore(selectAudienceId);
  const resetCampaign = useCampaignStore(selectResetCampaign);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);

  const handleFinish = useCallback(async () => {
    const campaign = {
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
    };
    console.log(campaign);
    try {
      toast.info('Publicando campanha...');
      await new Promise((r) => setTimeout(r, 1000));
      const campaignId = await createCampaign('Nova Campanha', objective);
      const adSetId = await createAdSet(campaignId, audienceId, {
        type: budgetType === 'daily' ? 'DAILY' : 'LIFETIME',
        value: budgetAmount,
      });
      await createAd(adSetId, creative.message, creative.files);
      toast.success('Campanha publicada com sucesso');
      resetCampaign();
    } catch (err) {
      console.error(err);
      toast.error('Falha ao publicar campanha');
    }
  }, [
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
    resetCampaign,
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Resumo Final</h2>
      <pre className="whitespace-pre-wrap break-all border p-2 rounded bg-gray-50">
        {JSON.stringify(
          {
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
          },
          null,
          2
        )}
      </pre>
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
          onClick={handleFinish}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default StepReview;
