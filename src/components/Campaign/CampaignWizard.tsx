import React from 'react';
import useCampaignStore from '../../stores/useCampaignStore';
import StepObjective from './steps/StepObjective';
import StepInvestment from '../../steps/StepInvestment';
import StepScheduling from './steps/StepScheduling';
import StepTargeting from './steps/StepTargeting';
import StepPlacements from './steps/StepPlacements';
import StepContent from './steps/StepContent';
import StepPreview from '../../steps/StepPreview';

const steps = [
  StepObjective,
  StepInvestment,
  StepScheduling,
  StepTargeting,
  StepPlacements,
  StepContent,
  StepPreview,
];

const CampaignWizard: React.FC = () => {
  const stepIndex = useCampaignStore((s) => s.stepIndex);
  const Current = steps[stepIndex] ?? StepInvestment;
  const totalSteps = steps.length;
  return (
    <div className="p-4 border rounded space-y-4 max-w-[720px] mx-auto">
      <div className="text-sm text-gray-600">Passo {stepIndex + 1} de {totalSteps}</div>
      <Current />
    </div>
  );
};

export default CampaignWizard;
