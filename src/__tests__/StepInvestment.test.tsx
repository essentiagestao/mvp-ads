import { render, screen, fireEvent } from '@testing-library/react';
import StepInvestment from '../steps/StepInvestment';
import useCampaignStore from '../stores/useCampaignStore';
import { vi } from 'vitest';

describe('StepInvestment', () => {
  beforeEach(() => {
    useCampaignStore.getState().resetCampaign();
  });

  it('validates amount and updates campaign on next', () => {
    const goNextSpy = vi.spyOn(useCampaignStore.getState(), 'goNext');
    const updateSpy = vi.spyOn(useCampaignStore.getState(), 'updateCampaign');

    render(<StepInvestment />);

    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/maior que zero/i);
    expect(goNextSpy).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Quanto você quer investir\?/i), {
      target: { value: '25' },
    });
    fireEvent.click(screen.getByLabelText(/Orçamento total/i));
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(updateSpy).toHaveBeenLastCalledWith({
      budgetType: 'total',
      budgetAmount: 25,
    });
    expect(goNextSpy).toHaveBeenCalled();
  });
});
