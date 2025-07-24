import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CampaignWizard from '../components/Campaign/CampaignWizard';
import { vi, beforeEach } from 'vitest';
import useCampaignStore from '../stores/useCampaignStore';
import { createCampaign } from '../services/campaign';

defineGlobals();

vi.mock('../services/campaign', () => ({
  createCampaign: vi.fn(() => Promise.resolve()),
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

    const startInput = await screen.findByLabelText(/Data de início/i);
    fireEvent.change(startInput, { target: { value: '2023-01-02' } });
    fireEvent.change(screen.getByLabelText(/Data de término/i), {
      target: { value: '2023-01-03' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    const audienceInput = await screen.findByLabelText(/Audience ID/i);
    fireEvent.change(audienceInput, { target: { value: 'aud-1' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    fireEvent.change(await screen.findByLabelText(/Mensagem/i), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(await screen.findByText(/Revise sua campanha/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar e Criar Campanha/i })
    );

    await waitFor(() => {
      expect(createCampaign).toHaveBeenCalledWith({
        budgetType: 'daily',
        budgetAmount: 50,
        startDate: '2023-01-02',
        endDate: '2023-01-03',
        audienceId: 'aud-1',
      });
    });
  });
});
