import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('useCampaignStore persistence', () => {
  it('restores state from localStorage on reload', async () => {
    const { default: useCampaignStore } = await import('../stores/useCampaignStore');
    useCampaignStore.getState().setStep('budget');

    const stored = localStorage.getItem('campaign-store');
    expect(stored).not.toBeNull();

    vi.resetModules();
    const { default: useCampaignStoreReloaded } = await import('../stores/useCampaignStore');
    expect(useCampaignStoreReloaded.getState().step).toBe('budget');
  });

  it('resetCampaign clears memory and storage', async () => {
    const { default: useCampaignStore } = await import('../stores/useCampaignStore');
    useCampaignStore.getState().setStep('creative');
    useCampaignStore.getState().resetCampaign();
    expect(useCampaignStore.getState().step).toBe('objective');
    expect(localStorage.getItem('campaign-store')).toBeNull();
  });
});
