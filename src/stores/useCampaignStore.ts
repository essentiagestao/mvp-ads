import { create } from 'zustand';

export interface CampaignBudgetValues {
  budgetType: 'daily' | 'total';
  budgetAmount: number;
  startDate: string;
  endDate: string;
}

export const initialBudget: CampaignBudgetValues = {
  budgetType: 'daily',
  budgetAmount: 10,
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
  reset: () => set({ ...initialBudget }),
}));

export default useCampaignStore;
