// src/components/BudgetEditor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  fetchBudgetItems,
  updateBudget,
  IBudgetItem
} from './mediaQueue';

// Extende o item vindo da API para manter o novo valor editável
interface EditableBudgetItem extends IBudgetItem {
  newBudget: number;
}

const BudgetEditor: React.FC = () => {
  const [items, setItems] = useState<EditableBudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // Carrega os orçamentos ao montar
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await fetchBudgetItems();
      setItems(
        fetched.map(i => ({ ...i, newBudget: i.currentBudget }))
      );
    } catch (err) {
      console.error(err);
      toast.error('Falha ao carregar orçamentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualiza o valor editável
  const handleBudgetChange = useCallback(
    (id: string, value: string) => {
      const val = parseFloat(value) || 0;
      setItems(curr =>
        curr.map(i =>
          i.id === id ? { ...i, newBudget: val } : i
        )
      );
    },
    []
  );

  // Aplica todas as alterações em batch
  const handleApplyChanges = useCallback(async () => {
    const changed = items.filter(i => i.newBudget !== i.currentBudget);
    if (changed.length === 0) {
      toast.info('Nenhuma alteração para aplicar.');
      return;
    }

    setUpdating(true);
    toast.info(`Atualizando ${changed.length} item(s)...`);

    // Atualiza em paralelo
    await Promise.all(
      changed.map(i =>
        updateBudget(i.id, i.newBudget)
          .then(() =>
            toast.success(`"${i.name}" atualizado para R$${i.newBudget}`)
          )
          .catch(() =>
            toast.error(`Erro ao atualizar "${i.name}"`)
          )
      )
    );

    // Recarrega e desabilita o loading
    await loadData();
    setUpdating(false);
  }, [items, loadData]);

  if (loading) {
    return <div>Carregando orçamentos...</div>;
  }

  const hasChanges = items.some(i => i.newBudget !== i.currentBudget);

  return (
    <div className="p-4 space-y-4 border rounded">
      <h2 className="text-lg font-bold">Edição de Orçamento</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Atual (R$)</th>
              <th>Novo (R$)</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.currentBudget.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    value={i.newBudget}
                    onChange={e => handleBudgetChange(i.id, e.target.value)}
                    disabled={updating}
                    min={0}
                    step={0.01}
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-2">
        <button
          onClick={handleApplyChanges}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          disabled={!hasChanges || updating}
        >
          {updating ? 'Atualizando...' : 'Aplicar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default BudgetEditor;
