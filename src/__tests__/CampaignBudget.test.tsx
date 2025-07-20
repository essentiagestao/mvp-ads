import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CampaignBudget, { CampaignBudgetValues } from '../components/Campaign/CampaignBudget';
import { vi } from 'vitest';

defineGlobals();

vi.mock('../components/mediaQueue', () => ({}));

function defineGlobals() {}

describe('CampaignBudget', () => {
  it('validates dates and triggers value changes', async () => {
    const handleChange = vi.fn();
    const initial: CampaignBudgetValues = {
      budgetType: 'daily',
      budgetAmount: 10,
      startDate: '',
      endDate: '',
    };
    render(<CampaignBudget {...initial} onChange={handleChange} />);

    const amountInput = screen.getByLabelText(/Valor do orçamento/i);
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '20' } });
    });
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith({ ...initial, budgetAmount: 20 });
    });

    const startInput = screen.getByLabelText(/Data de início/i);
    const endInput = screen.getByLabelText(/Data de término/i);

    await act(async () => {
      fireEvent.change(startInput, { target: { value: '2023-01-02' } });
      fireEvent.change(endInput, { target: { value: '2023-01-01' } });
    });

    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith({
        ...initial,
        budgetAmount: 20,
        startDate: '2023-01-02',
        endDate: '2023-01-01',
      });
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          /A data de término não pode ser anterior à data de início./i
        )
      ).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(endInput, { target: { value: '2023-01-03' } });
    });
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith({
        ...initial,
        budgetAmount: 20,
        startDate: '2023-01-02',
        endDate: '2023-01-03',
      });
    });
    await waitFor(() => {
      expect(
        screen.queryByText(
          /A data de término não pode ser anterior à data de início./i
        )
      ).not.toBeInTheDocument();
    });
  });
});
