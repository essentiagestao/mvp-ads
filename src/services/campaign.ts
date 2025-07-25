export interface CampaignPreview {
  budgetType: 'daily' | 'total';
  budgetAmount: number;
  startDate: string;
  endDate: string;
  audience: unknown;
  name: string;
}

export async function createCampaign(
  campaign: CampaignPreview
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (campaign.name === 'erro') {
    return false;
  }
  return true;
}
