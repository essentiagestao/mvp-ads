// src/__tests__/CampaignBudget.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import CampaignBudget from '../components/Campaign/CampaignBudget';
import { CampaignBudgetValues } from '../stores/useCampaignStore';
import { vi, describe, it, expect } from 'vitest';

describe('CampaignBudget', () => {
  it('validates dates and triggers value changes', async () => {
    const handleChange = vi.fn();
    let budgetValues: CampaignBudgetValues = {
      budgetType: 'daily',
      budgetAmount: 10,
      startDate: '',
      endDate: '',
    };

    const mockOnChange = (newValues: CampaignBudgetValues) => {
      budgetValues = newValues;
      handleChange(newValues);
    };

    const { rerender } = render(
      <CampaignBudget {...budgetValues} onChange={mockOnChange} />
    );

    // --- Ação 1: Mudar valor ---
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Valor do orçamento/i), {
        target: { value: '20' },
      });
    });
    rerender(<CampaignBudget {...budgetValues} onChange={mockOnChange} />);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ budgetAmount: 20 }));

    // --- Ação 2.1: Inserir data de início ---
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Data de início/i), {
        target: { value: '2023-01-02' },
      });
    });
    rerender(<CampaignBudget {...budgetValues} onChange={mockOnChange} />);

    // --- Ação 2.2: Inserir data de término inválida ---
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Data de término/i), {
        target: { value: '2023-01-01' },
      });
    });
    rerender(<CampaignBudget {...budgetValues} onChange={mockOnChange} />);

    // --- Assertiva 2: Agora o componente tem ambas as datas e pode exibir o erro ---
    expect(screen.getByText(/A data de término não pode ser anterior à data de início./i)).toBeInTheDocument();

    // --- Ação 3: Corrigir data ---
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Data de término/i), {
        target: { value: '2023-01-03' },
      });
    });
    rerender(<CampaignBudget {...budgetValues} onChange={mockOnChange} />);
    
    // --- Assertiva 3: O erro deve desaparecer ---
    expect(screen.queryByText(/A data de término não pode ser anterior à data de início./i)).not.toBeInTheDocument();
  });
});