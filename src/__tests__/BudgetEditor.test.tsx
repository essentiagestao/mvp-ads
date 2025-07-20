import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetEditor from '../components/BudgetEditor';
import { vi } from 'vitest';
import { fetchBudgetItems, updateBudget } from '../components/mediaQueue';

vi.mock('../components/mediaQueue', () => ({
  fetchBudgetItems: vi.fn(),
  updateBudget: vi.fn(),
}));

describe('BudgetEditor', () => {
  it('allows editing budget and applying changes', async () => {
    (fetchBudgetItems as any).mockResolvedValue([
      { id: '1', name: 'Item 1', currentBudget: 10 },
    ]);

    render(<BudgetEditor />);

    const input = await screen.findByDisplayValue('10');
    fireEvent.change(input, { target: { value: '20' } });

    const button = screen.getByRole('button', { name: /Aplicar Alterações/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(updateBudget).toHaveBeenCalledWith('1', 20);
    });
  });
});