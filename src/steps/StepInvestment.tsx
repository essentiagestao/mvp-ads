import React, { useState } from 'react';
import { Info } from 'lucide-react';
import useCampaignStore from '../stores/useCampaignStore';

const StepInvestment: React.FC = () => {
  const budgetType = useCampaignStore((s) => s.budgetType);
  const budgetAmount = useCampaignStore((s) => s.budgetAmount);
  const setBudgetType = useCampaignStore((s) => s.setBudgetType);
  const setBudgetAmount = useCampaignStore((s) => s.setBudgetAmount);
  const updateCampaign = useCampaignStore((s) => s.updateCampaign);
  const goNext = useCampaignStore((s) => s.goNext);
  const goBack = useCampaignStore((s) => s.goBack);
  const stepIndex = useCampaignStore((s) => s.stepIndex);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (budgetAmount < 1) {
      setError('O orçamento deve ser maior que zero.');
      return;
    }
    updateCampaign({ budgetType, budgetAmount });
    setError('');
    goNext();
  };

  return (
    <div className="space-y-6 max-w-[720px] mx-auto px-4">
      <h2 className="text-lg font-bold flex items-center gap-1">
        Investimento <Info size={16} className="text-gray-500" />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fieldset className="space-y-2">
          <legend className="font-medium">Tipo de orçamento</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="daily"
              checked={budgetType === 'daily'}
              onChange={(e) => setBudgetType(e.target.value as 'daily')}
            />
            <span className="flex items-center gap-1">
              Orçamento diário
              <Info
                size={14}
                className="text-gray-500"
                title="Diário: valor gasto por dia."
              />
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="total"
              checked={budgetType === 'total'}
              onChange={(e) => setBudgetType(e.target.value as 'total')}
            />
            <span className="flex items-center gap-1">
              Orçamento total
              <Info
                size={14}
                className="text-gray-500"
                title="Total: valor total da campanha até o final."
              />
            </span>
          </label>
        </fieldset>
        <div>
          <label className="block mb-1 font-medium" htmlFor="budgetAmount">
            Quanto você quer investir?
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            <input
              id="budgetAmount"
              type="number"
              min={1}
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(Number(e.target.value))}
              className="border rounded px-2 py-1 pl-7 w-full"
              aria-label="Quanto você quer investir?"
            />
          </div>
        </div>
      </div>
      {error && (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      )}
      <div className="flex space-x-2">
        {stepIndex > 0 && (
          <button
            onClick={goBack}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default StepInvestment;
