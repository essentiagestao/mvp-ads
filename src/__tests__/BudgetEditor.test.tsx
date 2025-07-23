// src/__tests__/BudgetEditor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetEditor from '../components/BudgetEditor';
import { vi, describe, it, expect } from 'vitest';
import { fetchBudgetItems, updateBudget } from '../components/mediaQueue';

// MUDANÇA: Ajuste no mock para updateBudget retornar uma Promise
vi.mock('../components/mediaQueue', () => ({
  fetchBudgetItems: vi.fn(),
  // A função updateBudget agora retorna uma Promise resolvida, como o componente espera.
  updateBudget: vi.fn().mockResolvedValue(undefined),
}));

describe('BudgetEditor', () => {
  it('allows editing budget and applying changes', async () => {
    // Para o teste, garantimos que fetchBudgetItems é um mock antes de usá-lo
    (fetchBudgetItems as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Item 1', currentBudget: 10 },
    ]);

    // O mock de updateBudget já está configurado para retornar uma Promise
    (updateBudget as ReturnType<typeof vi.fn>).mockClear(); // Limpa chamadas anteriores

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