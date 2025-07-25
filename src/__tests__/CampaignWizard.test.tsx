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

    const objectiveOption = screen.getByLabelText(/Cliques no Link/i);
    fireEvent.click(objectiveOption);
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    const amountInput = await screen.findByLabelText(/Quanto você quer investir\?/i);
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    const startInput = await screen.findByLabelText(/Data de início/i);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    fireEvent.change(startInput, { target: { value: today } });
    fireEvent.change(screen.getByLabelText(/Quando a campanha termina\?/i), {
      target: { value: tomorrow },
    });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    await screen.findByLabelText(/Nome do Público/i);
    fireEvent.change(screen.getByLabelText(/Nome do Público/i), {
      target: { value: 'aud-1' },
    });
    fireEvent.change(screen.getByLabelText(/Localização/i), {
      target: { value: 'sp' },
    });
    fireEvent.change(screen.getByLabelText(/Interesses/i), {
      target: { value: 'tech' },
    });
    fireEvent.change(screen.getByLabelText(/Idade mínima/i), {
      target: { value: '18' },
    });
    fireEvent.change(screen.getByLabelText(/Idade máxima/i), {
      target: { value: '30' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    await screen.findByText(/Posicionamentos/);
    fireEvent.click(screen.getByLabelText(/Feed/));
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    fireEvent.change(await screen.findByLabelText(/Texto principal do anúncio/i), {
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
        startDate: today,
        endDate: tomorrow,
        audience: {
          name: 'aud-1',
          location: 'sp',
          interests: 'tech',
          ageMin: 18,
          ageMax: 30,
          useSaved: false,
        },
        objective: 'LINK_CLICKS',
        placements: ['Feed'],
        name: '',
      });
    });
  });
});
