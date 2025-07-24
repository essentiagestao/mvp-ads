import React from 'react';
import useCampaignStore from '../../stores/useCampaignStore';
import StepInvestment from '../../steps/StepInvestment';
import StepScheduling from './steps/StepScheduling';
import StepTargeting from './steps/StepTargeting';
import StepContent from './steps/StepContent';
import StepReview from './steps/StepReview';

const steps = [
  StepInvestment,
  StepScheduling,
  StepTargeting,
  StepContent,
  StepReview,
];

const CampaignWizard: React.FC = () => {
  const stepIndex = useCampaignStore((s) => s.stepIndex);
  const Current = steps[stepIndex] ?? StepInvestment;
  return (
    <div className="p-4 border rounded space-y-4">
      <Current />
    </div>
  );
};

export default CampaignWizard;
