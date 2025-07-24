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

    fireEvent.change(startInput, { target: { value: '2023-01-02' } });
    fireEvent.change(endInput, { target: { value: '2023-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /A data de término não pode ser anterior à data de início./i
    );
    expect(goNextSpy).not.toHaveBeenCalled();

    fireEvent.change(endInput, { target: { value: '2023-01-03' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(updateSpy).toHaveBeenLastCalledWith({
      startDate: '2023-01-02',
      endDate: '2023-01-03',
    });
    expect(goNextSpy).toHaveBeenCalled();
  });
});
