import { render, screen, fireEvent } from '@testing-library/react';
import StepScheduling from '../components/Campaign/steps/StepScheduling';
import useCampaignStore from '../stores/useCampaignStore';
import { vi } from 'vitest';

describe('StepScheduling', () => {
  beforeEach(() => {
    useCampaignStore.getState().resetCampaign();
  });

  it('validates dates and updates campaign on next', () => {
    const goNextSpy = vi.spyOn(useCampaignStore.getState(), 'goNext');
    const updateSpy = vi.spyOn(useCampaignStore.getState(), 'updateCampaign');

    render(<StepScheduling />);

    const startInput = screen.getByLabelText(/Data de início/i);
    const endInput = screen.getByLabelText(/Quando a campanha termina\?/i);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    fireEvent.change(startInput, { target: { value: tomorrow } });
    fireEvent.change(endInput, { target: { value: today } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /A data de término não pode ser anterior à data de início./i
    );
    expect(goNextSpy).not.toHaveBeenCalled();

    const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    fireEvent.change(endInput, { target: { value: dayAfter } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(updateSpy).toHaveBeenLastCalledWith({
      startDate: tomorrow,
      endDate: dayAfter,
    });
    expect(goNextSpy).toHaveBeenCalled();
  });
});
