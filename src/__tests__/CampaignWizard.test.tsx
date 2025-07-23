import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CampaignWizard from '../components/Campaign/CampaignWizard';
import { vi, beforeEach } from 'vitest';
import useCampaignStore from '../stores/useCampaignStore';
import { createCampaign, createAdSet, createAd } from '../components/mediaQueue';

defineGlobals();

vi.mock('../components/mediaQueue', () => ({
  createCampaign: vi.fn(() => Promise.resolve('camp')),
  createAdSet: vi.fn(() => Promise.resolve('adset')),
  createAd: vi.fn(() => Promise.resolve('ad')),
}));

vi.mock('react-toastify', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

function defineGlobals() {}

describe('CampaignWizard', () => {
  beforeEach(() => {
    useCampaignStore.getState().resetCampaign();
  });
  it('steps through wizard and publishes campaign', async () => {
    render(<CampaignWizard />);

    const amountInput = screen.getByLabelText(/Valor do orçamento/i);
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    const audienceInput = await screen.findByLabelText(/Audience ID/i);
    fireEvent.change(audienceInput, { target: { value: 'aud-1' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    fireEvent.change(await screen.findByLabelText(/Mensagem/i), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(await screen.findByText(/Resumo Final/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    await waitFor(() => {
      expect(createCampaign).toHaveBeenCalledWith('Nova Campanha', '');
      expect(createAdSet).toHaveBeenCalled();
      expect(createAd).toHaveBeenCalled();
    });
  });
});
