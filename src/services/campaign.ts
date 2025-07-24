export interface CampaignPreview {
  budgetType: 'daily' | 'total';
  budgetAmount: number;
  startDate: string;
  endDate: string;
  audienceId: string;
}

export async function createCampaign(
  campaign: CampaignPreview
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}
