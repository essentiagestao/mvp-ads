import React, { useState, useCallback } from 'react';
import CampaignAudience from './CampaignAudience';
import CampaignBudget, { CampaignBudgetValues } from './CampaignBudget';
import CampaignCreative, { CampaignCreativeValues } from './CampaignCreative';
import { createCampaign, createAdSet, createAd } from '../mediaQueue';
import { toast } from 'react-toastify';

interface WizardData {
  audienceId: string;
  budget: CampaignBudgetValues;
  creative: CampaignCreativeValues;
}

const initialData: WizardData = {
  audienceId: '',
  budget: { budgetType: 'daily', budgetAmount: 0, startDate: '', endDate: '' },
  creative: { files: [], message: '', link: '', page: '' },
};

const steps = ['audience', 'budget', 'creative'] as const;
type Step = typeof steps[number];

const CampaignWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('audience');
  const [data, setData] = useState<WizardData>(initialData);
  const stepIndex = steps.indexOf(step);

  const handleAudienceChange = useCallback((audienceId: string) => {
    setData(prev => ({ ...prev, audienceId }));
  }, []);

  const handleBudgetChange = useCallback((budget: CampaignBudgetValues) => {
    setData(prev => ({ ...prev, budget }));
  }, []);

  const handleCreativeChange = useCallback((creative: CampaignCreativeValues) => {
    setData(prev => ({ ...prev, creative }));
  }, []);

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
      const campaignId = await createCampaign('Nova Campanha', 'LINK_CLICKS');
      const adSetId = await createAdSet(campaignId, data.audienceId, {
        type: data.budget.budgetType === 'daily' ? 'DAILY' : 'LIFETIME',
        value: data.budget.budgetAmount,
      });
      await createAd(adSetId, data.creative.message, data.creative.files);
      toast.success('Campanha publicada com sucesso');
      setData(initialData);
      setStep('audience');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao publicar campanha');
    }
  }, [data]);

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-bold">Campaign Wizard</h2>
      {step === 'audience' && (
        <CampaignAudience
          audienceId={data.audienceId}
          onChange={handleAudienceChange}
        />
      )}
      {step === 'budget' && (
        <CampaignBudget
          budgetType={data.budget.budgetType}
          budgetAmount={data.budget.budgetAmount}
          startDate={data.budget.startDate}
          endDate={data.budget.endDate}
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
