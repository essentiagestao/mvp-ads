import { create } from 'zustand';

export interface CampaignBudgetValues {
  budgetType: 'daily' | 'total';
  budgetAmount: number;
  startDate: string;
  endDate: string;
}

interface CampaignState {
  budget: CampaignBudgetValues;
  setBudget: (b: CampaignBudgetValues) => void;
}

export const useCampaignStore = create<CampaignState>(set => ({
  budget: { budgetType: 'daily', budgetAmount: 10, startDate: '', endDate: '' },
  setBudget: budget => set({ budget })
}));

export default useCampaignStore;
