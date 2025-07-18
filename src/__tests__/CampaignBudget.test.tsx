import { render, screen, fireEvent } from '@testing-library/react';
import CampaignBudget, { CampaignBudgetValues } from '../components/Campaign/CampaignBudget';
import { vi } from 'vitest';

defineGlobals();

vi.mock('../components/mediaQueue', () => ({}));

function defineGlobals() {}

describe('CampaignBudget', () => {
  it('validates dates and triggers value changes', () => {
    const handleChange = vi.fn();
    const initial: CampaignBudgetValues = {
      budgetType: 'daily',
      budgetAmount: 10,
      startDate: '',
      endDate: '',
    };
    render(<CampaignBudget {...initial} onChange={handleChange} />);

    const amountInput = screen.getByLabelText(/Valor do orçamento/i);
    fireEvent.change(amountInput, { target: { value: '20' } });
    expect(handleChange).toHaveBeenCalledWith({ ...initial, budgetAmount: 20 });

    const startInput = screen.getByLabelText(/Data de início/i);
    const endInput = screen.getByLabelText(/Data de término/i);

    fireEvent.change(startInput, { target: { value: '2023-01-02' } });
    fireEvent.change(endInput, { target: { value: '2023-01-01' } });

    expect(handleChange).toHaveBeenLastCalledWith({
      ...initial,
      budgetAmount: 20,
      startDate: '2023-01-02',
      endDate: '2023-01-01',
    });
    expect(
      screen.getByText(
        /A data de término não pode ser anterior à data de início./i
      )
    ).toBeInTheDocument();

    fireEvent.change(endInput, { target: { value: '2023-01-03' } });
    expect(handleChange).toHaveBeenLastCalledWith({
      ...initial,
      budgetAmount: 20,
      startDate: '2023-01-02',
      endDate: '2023-01-03',
    });
    expect(
      screen.queryByText(
        /A data de término não pode ser anterior à data de início./i
      )
    ).not.toBeInTheDocument();
  });
});
