import React, { useCallback } from 'react';
import CampaignAudience from './CampaignAudience';
import CampaignBudget from './CampaignBudget';
import CampaignCreative, { CampaignCreativeValues } from './CampaignCreative';
import CampaignObjective from './CampaignObjective';
import { createCampaign, createAdSet, createAd } from '../mediaQueue';
import { toast } from 'react-toastify';
import useCampaignStore, {
  CampaignBudgetValues,
  wizardSteps,
  selectBudgetAmount,
  selectBudgetType,
  selectStartDate,
  selectEndDate,
  selectStep,
  selectSetStep,
  selectSetBudgetAmount,
  selectSetBudgetType,
  selectSetStartDate,
  selectSetEndDate,
  selectObjective,
  selectAudienceId,
  selectCreative,
  selectSetObjective,
  selectSetAudienceId,
  selectSetCreative,
  selectResetCampaign,
} from '../../stores/useCampaignStore';

const CampaignWizard: React.FC = () => {
  const step = useCampaignStore(selectStep);
  const setStep = useCampaignStore(selectSetStep);
  const stepIndex = wizardSteps.indexOf(step);
  const budgetAmount = useCampaignStore(selectBudgetAmount);
  const budgetType = useCampaignStore(selectBudgetType);
  const startDate = useCampaignStore(selectStartDate);
  const endDate = useCampaignStore(selectEndDate);
  const objective = useCampaignStore(selectObjective);
  const audienceId = useCampaignStore(selectAudienceId);
  const creative = useCampaignStore(selectCreative);
  const setBudgetAmount = useCampaignStore(selectSetBudgetAmount);
  const setBudgetType = useCampaignStore(selectSetBudgetType);
  const setStartDate = useCampaignStore(selectSetStartDate);
  const setEndDate = useCampaignStore(selectSetEndDate);
  const setObjective = useCampaignStore(selectSetObjective);
  const setAudienceId = useCampaignStore(selectSetAudienceId);
  const setCreative = useCampaignStore(selectSetCreative);
  const resetCampaign = useCampaignStore(selectResetCampaign);

  const handleObjectiveChange = useCallback(
    (value: string) => {
      setObjective(value);
    },
    [setObjective]
  );

  const handleAudienceChange = useCallback(
    (value: string) => {
      setAudienceId(value);
    },
    [setAudienceId]
  );


  const handleCreativeChange = useCallback(
    (value: CampaignCreativeValues) => {
      setCreative(value);
    },
    [setCreative]
  );

  const handleBudgetChange = useCallback(
    (values: CampaignBudgetValues) => {
      setBudgetAmount(values.budgetAmount);
      setBudgetType(values.budgetType);
      setStartDate(values.startDate);
      setEndDate(values.endDate);
    },
    [setBudgetAmount, setBudgetType, setStartDate, setEndDate]
  );

  const handleNext = useCallback(() => {
    if (stepIndex < wizardSteps.length - 1) {
      setStep(wizardSteps[stepIndex + 1]);
    }
  }, [stepIndex, setStep]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      setStep(wizardSteps[stepIndex - 1]);
    }
  }, [stepIndex, setStep]);

  const handleFinish = useCallback(async () => {
    try {
      toast.info('Publicando campanha...');
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
  }, [budgetAmount, budgetType, objective, audienceId, creative, resetCampaign]);

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-bold">Campaign Wizard</h2>
      {step === 'objective' && (
        <CampaignObjective objective={objective} onChange={handleObjectiveChange} />
      )}
      {step === 'audience' && (
        <CampaignAudience audienceId={audienceId} onChange={handleAudienceChange} />
      )}
      {step === 'budget' && (
        <CampaignBudget
          budgetAmount={budgetAmount}
          budgetType={budgetType}
          startDate={startDate}
          endDate={endDate}
          onChange={handleBudgetChange}
        />
      )}
      {step === 'creative' && (
        <CampaignCreative
          files={creative.files}
          message={creative.message}
          link={creative.link}
          page={creative.page}
          onChange={handleCreativeChange}
        />
      )}
      <div className="flex space-x-2">
        {stepIndex > 0 && (
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Voltar
          </button>
        )}
        {stepIndex < wizardSteps.length - 1 && (
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Próximo
          </button>
        )}
        {stepIndex === wizardSteps.length - 1 && (
          <button
            onClick={handleFinish}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignWizard;
