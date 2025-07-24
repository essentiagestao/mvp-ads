import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const wizardSteps = [
  'budget',
  'scheduling',
  'targeting',
  'content',
  'preview',
] as const;
export type WizardStep = typeof wizardSteps[number];

export type BudgetType = 'daily' | 'total';

export interface CampaignCreativeValues {
  files: File[];
  message: string;
  link: string;
  page: string;
}

export interface CampaignTargeting {
  [key: string]: unknown;
}

export interface CampaignBudgetValues {
  budgetType: BudgetType;
  budgetAmount: number;
  startDate: string;
  endDate: string;
}

export const initialStep: WizardStep = 'budget';

export const initialBudget: CampaignBudgetValues = {
  budgetType: 'daily',
  budgetAmount: 0,
  startDate: '',
  endDate: '',
};

export interface CampaignValues extends CampaignBudgetValues {
  name: string;
  objective: string;
  audienceId: string;
  creative: CampaignCreativeValues;
  targeting: CampaignTargeting | null;
  placements: string[];
  media: File[];
}

export const initialCampaign: CampaignValues = {
  ...initialBudget,
  name: '',
  objective: '',
  audienceId: '',
  creative: { files: [], message: '', link: '', page: '' },
  targeting: null,
  placements: [],
  media: [],
};

export interface CampaignState extends CampaignValues {
  step: WizardStep;
  stepIndex: number;
  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goNext: () => void;
  goBack: () => void;
  setBudgetAmount: (budgetAmount: number) => void;
  setBudgetType: (budgetType: BudgetType) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  setObjective: (objective: string) => void;
  setAudienceId: (audienceId: string) => void;
  setName: (name: string) => void;
  setCreative: (creative: CampaignCreativeValues) => void;
  setTargeting: (targeting: CampaignTargeting | null) => void;
  setPlacements: (placements: string[]) => void;
  setMedia: (media: File[]) => void;
  updateCampaign: (values: Partial<CampaignValues>) => void;
  setDates: (dates: { startDate: string; endDate: string }) => void;
  reset: () => void;
  resetCampaign: () => void;
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => {
      const setStep = (step: WizardStep) =>
        set({ step, stepIndex: wizardSteps.indexOf(step) });
      const next = () => {
        const idx = get().stepIndex;
        if (idx < wizardSteps.length - 1) {
          const step = wizardSteps[idx + 1];
          set({ step, stepIndex: idx + 1 });
        }
      };
      const previous = () => {
        const idx = get().stepIndex;
        if (idx > 0) {
          const step = wizardSteps[idx - 1];
          set({ step, stepIndex: idx - 1 });
        }
      };
      return {
        ...initialCampaign,
        step: initialStep,
        stepIndex: wizardSteps.indexOf(initialStep),
        setBudgetAmount: budgetAmount => set({ budgetAmount }),
        setBudgetType: budgetType => set({ budgetType }),
        setStartDate: startDate => set({ startDate }),
        setEndDate: endDate => set({ endDate }),
        setObjective: objective => set({ objective }),
        setName: name => set({ name }),
        setAudienceId: audienceId => set({ audienceId }),
        setCreative: creative => set({ creative }),
        setTargeting: targeting => set({ targeting }),
        setPlacements: placements => set({ placements }),
        setMedia: media => set({ media }),
        updateCampaign: values => set({ ...values }),
        setDates: dates => set({ ...dates }),
        setStep,
        nextStep: next,
        previousStep: previous,
        goNext: next,
        goBack: previous,
        reset: () =>
          set({
            ...initialBudget,
            budgetAmount: 0,
          }),
      resetCampaign: () => {
        set({
          ...initialCampaign,
          step: initialStep,
          stepIndex: wizardSteps.indexOf(initialStep),
        });
        localStorage.removeItem('campaign-store');
      },
      };
    },
    {
      name: 'campaign-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const selectBudgetAmount = (state: CampaignState) => state.budgetAmount;
export const selectBudgetType = (state: CampaignState) => state.budgetType;
export const selectStartDate = (state: CampaignState) => state.startDate;
export const selectEndDate = (state: CampaignState) => state.endDate;
export const selectObjective = (state: CampaignState) => state.objective;
export const selectAudienceId = (state: CampaignState) => state.audienceId;
export const selectName = (state: CampaignState) => state.name;
export const selectCreative = (state: CampaignState) => state.creative;
export const selectTargeting = (state: CampaignState) => state.targeting;
export const selectPlacements = (state: CampaignState) => state.placements;
export const selectMedia = (state: CampaignState) => state.media;
export const selectStep = (state: CampaignState) => state.step;
export const selectNextStep = (state: CampaignState) => state.nextStep;
export const selectPreviousStep = (state: CampaignState) => state.previousStep;
export const selectStepIndex = (state: CampaignState) => state.stepIndex;
export const selectGoNext = (state: CampaignState) => state.goNext;
export const selectGoBack = (state: CampaignState) => state.goBack;

export const selectSetBudgetAmount = (state: CampaignState) =>
  state.setBudgetAmount;
export const selectSetBudgetType = (state: CampaignState) => state.setBudgetType;
export const selectSetStartDate = (state: CampaignState) => state.setStartDate;
export const selectSetEndDate = (state: CampaignState) => state.setEndDate;
export const selectSetObjective = (state: CampaignState) => state.setObjective;
export const selectSetAudienceId = (state: CampaignState) => state.setAudienceId;
export const selectSetName = (state: CampaignState) => state.setName;
export const selectSetCreative = (state: CampaignState) => state.setCreative;
export const selectSetTargeting = (state: CampaignState) => state.setTargeting;
export const selectSetPlacements = (state: CampaignState) => state.setPlacements;
export const selectSetMedia = (state: CampaignState) => state.setMedia;
export const selectUpdateCampaign = (state: CampaignState) => state.updateCampaign;
export const selectSetDates = (state: CampaignState) => state.setDates;
export const selectSetStep = (state: CampaignState) => state.setStep;
export const selectReset = (state: CampaignState) => state.reset;
export const selectResetCampaign = (state: CampaignState) => state.resetCampaign;

export default useCampaignStore;
