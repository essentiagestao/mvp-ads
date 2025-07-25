import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StepPreview from '../steps/StepPreview';
import useCampaignStore from '../stores/useCampaignStore';
import { vi } from 'vitest';
import { act } from 'react';
import * as campaignService from '../services/campaign';

describe('StepPreview', () => {
  beforeEach(() => {
    useCampaignStore.getState().resetCampaign();
  });

  it('shows data and handles actions', async () => {
    const state = useCampaignStore.getState();
    act(() => {
      state.setBudgetType('total');
      state.setBudgetAmount(100);
      state.setStartDate('2023-01-01');
      state.setEndDate('2023-01-02');
      state.setObjective('LINK_CLICKS');
      state.setPlacements(['Feed']);
      state.setAudience({
        name: 'aud1',
        location: 'sp',
        interests: 'tech',
        ageMin: 18,
        ageMax: 30,
        useSaved: false,
      });
      state.setStep('preview');
    });

    const createCampaignSpy = vi
      .spyOn(campaignService, 'createCampaign')
      .mockResolvedValue(true);

    render(<StepPreview />);

    expect(screen.getByText(/Total/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-02/)).toBeInTheDocument();
    expect(screen.getByText(/aud1/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Editar campanha/i }));
    expect(useCampaignStore.getState().stepIndex).toBe(0);

    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar e Criar Campanha/i })
    );

    await waitFor(() => {
      expect(createCampaignSpy).toHaveBeenCalledWith({
        budgetType: 'total',
        budgetAmount: 100,
        startDate: '2023-01-01',
        endDate: '2023-01-02',
        audience: {
          name: 'aud1',
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

    expect(
      await screen.findByText(/Campanha criada com sucesso!/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Criar nova campanha/i }));

    expect(useCampaignStore.getState().stepIndex).toBe(0);
    expect(useCampaignStore.getState().audienceId).toBe('');
  });
});
