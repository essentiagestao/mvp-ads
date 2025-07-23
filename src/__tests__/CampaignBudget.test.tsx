// src/__tests__/CampaignBudget.test.tsx
/// <reference types="vitest" />

// MUDANÇA 1: 'act' importado de 'react' e 'vitest' explícito.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, it, expect } from 'vitest';
import CampaignBudget, { CampaignBudgetValues } from '../components/Campaign/CampaignBudget';

vi.mock('../components/mediaQueue', () => ({}));

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

    // --- Ação 1: Mudar o valor do orçamento ---
    await act(async () => {
      const amountInput = screen.getByLabelText(/Valor do orçamento/i);
      fireEvent.change(amountInput, { target: { value: '20' } });
    });

    // Assertiva 1: Verifica se a primeira mudança foi registrada.
    expect(handleChange).toHaveBeenCalledWith({
      budgetType: 'daily',
      budgetAmount: 20,
      startDate: '',
      endDate: '',
    });

    // --- MUDANÇA 2: Ações de mudança de data agrupadas em um único 'act' ---
    await act(async () => {
      const startInput = screen.getByLabelText(/Data de início/i);
      const endInput = screen.getByLabelText(/Data de término/i);
      fireEvent.change(startInput, { target: { value: '2023-01-02' } });
      fireEvent.change(endInput, { target: { value: '2023-01-01' } });
    });

    // Assertiva 2: Verifica a chamada com datas inválidas e se a mensagem de erro aparece.
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith({
        budgetType: 'daily',
        budgetAmount: 20,
        startDate: '2023-01-02',
        endDate: '2023-01-01',
      });
      expect(screen.getByText(/A data de término não pode ser anterior à data de início./i)).toBeInTheDocument();
    });

    // --- Ação 3: Corrigir a data de término ---
    await act(async () => {
      const endInput = screen.getByLabelText(/Data de término/i);
      fireEvent.change(endInput, { target: { value: '2023-01-03' } });
    });

    // Assertiva 3: Verifica a chamada final e se a mensagem de erro desaparece.
    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith({
        budgetType: 'daily',
        budgetAmount: 20,
        startDate: '2023-01-02',
        endDate: '2023-01-03',
      });
      expect(screen.queryByText(/A data de término não pode ser anterior à data de início./i)).not.toBeInTheDocument();
    });
  });
});