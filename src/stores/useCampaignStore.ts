import { create } from 'zustand';

export interface CampaignBudgetValues {
  budgetType: 'daily' | 'total';
  budgetAmount: number;
  startDate: string;
  endDate: string;
}

export const initialBudget: CampaignBudgetValues = {
  budgetType: 'daily',
  budgetAmount: 0,
  startDate: '',
  endDate: '',
};

interface CampaignState extends CampaignBudgetValues {
  setBudgetAmount: (budgetAmount: number) => void;
  setBudgetType: (budgetType: 'daily' | 'total') => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  reset: () => void;
}

export const useCampaignStore = create<CampaignState>(set => ({
  ...initialBudget,
  setBudgetAmount: budgetAmount => set({ budgetAmount }),
  setBudgetType: budgetType => set({ budgetType }),
  setStartDate: startDate => set({ startDate }),
  setEndDate: endDate => set({ endDate }),
  reset: () => set({
    ...initialBudget,
    budgetAmount: 0,
  }),
}));

export const selectBudgetAmount = (state: CampaignState) => state.budgetAmount;
export const selectBudgetType = (state: CampaignState) => state.budgetType;
export const selectStartDate = (state: CampaignState) => state.startDate;
export const selectEndDate = (state: CampaignState) => state.endDate;

export const selectSetBudgetAmount = (state: CampaignState) =>
  state.setBudgetAmount;
export const selectSetBudgetType = (state: CampaignState) => state.setBudgetType;
export const selectSetStartDate = (state: CampaignState) => state.setStartDate;
export const selectSetEndDate = (state: CampaignState) => state.setEndDate;
export const selectReset = (state: CampaignState) => state.reset;

export default useCampaignStore;
