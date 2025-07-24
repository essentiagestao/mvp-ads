export interface CampaignPreview {
  budgetType: 'daily' | 'total';
  budgetAmount: number;
  startDate: string;
  endDate: string;
  audienceId: string;
}

export async function createCampaign(campaign: CampaignPreview): Promise<void> {
  console.log('Criando campanha', campaign);
  return Promise.resolve();
}
