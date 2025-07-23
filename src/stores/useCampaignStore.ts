import { create } from 'zustand';

export interface CampaignBudgetValues {
  budgetType: 'daily' | 'lifetime';
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

interface CampaignState {
  budget: CampaignBudgetValues;
  setBudget: (b: CampaignBudgetValues) => void;
}

export const useCampaignStore = create<CampaignState>(set => ({
  budget: initialBudget,
  setBudget: budget => set({ budget }),
}));

export default useCampaignStore;
