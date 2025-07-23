import React, { useState, useCallback } from 'react';
import CampaignAudience from './CampaignAudience';
import CampaignBudget from './CampaignBudget';
import CampaignCreative, { CampaignCreativeValues } from './CampaignCreative';
import CampaignObjective from './CampaignObjective';
import { createCampaign, createAdSet, createAd } from '../mediaQueue';
import { toast } from 'react-toastify';
import useCampaignStore, {
  CampaignBudgetValues,
  selectBudgetAmount,
  selectBudgetType,
  selectStartDate,
  selectEndDate,
  selectSetBudgetAmount,
  selectSetBudgetType,
  selectSetStartDate,
  selectSetEndDate,
} from '../../stores/useCampaignStore';

interface WizardData {
  objective: string;
  audienceId: string;
  creative: CampaignCreativeValues;
}

const initialData: WizardData = {
  objective: 'LINK_CLICKS',
  audienceId: '',
  creative: { files: [], message: '', link: '', page: '' },
};

const steps = ['objective', 'audience', 'budget', 'creative'] as const;
type Step = typeof steps[number];

const CampaignWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('objective');
  const [data, setData] = useState<WizardData>(initialData);
  const stepIndex = steps.indexOf(step);
  const budgetAmount = useCampaignStore(selectBudgetAmount);
  const budgetType = useCampaignStore(selectBudgetType);
  const startDate = useCampaignStore(selectStartDate);
  const endDate = useCampaignStore(selectEndDate);
  const setBudgetAmount = useCampaignStore(selectSetBudgetAmount);
  const setBudgetType = useCampaignStore(selectSetBudgetType);
  const setStartDate = useCampaignStore(selectSetStartDate);
  const setEndDate = useCampaignStore(selectSetEndDate);

  const handleObjectiveChange = useCallback((objective: string) => {
    setData(prev => ({ ...prev, objective }));
  }, []);

  const handleAudienceChange = useCallback((audienceId: string) => {
    setData(prev => ({ ...prev, audienceId }));
  }, []);


  const handleCreativeChange = useCallback((creative: CampaignCreativeValues) => {
    setData(prev => ({ ...prev, creative }));
  }, []);

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
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
    }
  }, [stepIndex]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    }
  }, [stepIndex]);

  const handleFinish = useCallback(async () => {
    try {
      toast.info('Publicando campanha...');
      const campaignId = await createCampaign('Nova Campanha', data.objective);
      const adSetId = await createAdSet(campaignId, data.audienceId, {
        type: budgetType === 'daily' ? 'DAILY' : 'LIFETIME',
        value: budgetAmount,
      });
      await createAd(adSetId, data.creative.message, data.creative.files);
      toast.success('Campanha publicada com sucesso');
      setData(initialData);
      useCampaignStore.getState().reset();
      setStep('objective');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao publicar campanha');
    }
  }, [budgetAmount, budgetType, data]);

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-bold">Campaign Wizard</h2>
      {step === 'objective' && (
        <CampaignObjective
          objective={data.objective}
          onChange={handleObjectiveChange}
        />
      )}
      {step === 'audience' && (
        <CampaignAudience
          audienceId={data.audienceId}
          onChange={handleAudienceChange}
        />
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
          files={data.creative.files}
          message={data.creative.message}
          link={data.creative.link}
          page={data.creative.page}
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
        {stepIndex < steps.length - 1 && (
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Próximo
          </button>
        )}
        {stepIndex === steps.length - 1 && (
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
