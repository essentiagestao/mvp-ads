import React from 'react';
import { CampaignBudgetValues, BudgetType } from '../../stores/useCampaignStore';

interface CampaignBudgetProps extends CampaignBudgetValues {
  onChange: (values: CampaignBudgetValues) => void;
}

const CampaignBudget: React.FC<CampaignBudgetProps> = ({
  budgetType,
  budgetAmount,
  startDate,
  endDate,
  onChange,
}) => {
  const handleChange = (
    field: keyof CampaignBudgetValues,
    value: string
  ) => {
    const next: CampaignBudgetValues = {
      budgetType,
      budgetAmount,
      startDate,
      endDate,
      [field]: field === 'budgetAmount' ? Number(value) : value,
    } as CampaignBudgetValues;
    onChange(next);
  };

  const isDateInvalid =
    startDate !== '' &&
    endDate !== '' &&
    new Date(endDate) < new Date(startDate);

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="text-lg font-bold">Orçamento</h3>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-1">
          <input
            type="radio"
            value="daily"
            checked={budgetType === 'daily'}
            onChange={(e) => handleChange('budgetType', e.target.value)}
          />
          <span>Diário</span>
        </label>
        <label className="flex items-center space-x-1">
          <input
            type="radio"
            value="total"
            checked={budgetType === 'total'}
            onChange={(e) => handleChange('budgetType', e.target.value)}
          />
          <span>Vitalício</span>
        </label>
      </div>
      <div>
        <label className="block mb-1 font-medium" htmlFor="budgetAmount">
          Quanto você quer investir?
        </label>
        <input
          id="budgetAmount"
          type="number"
          min={1}
          required
          value={budgetAmount}
          onChange={(e) => handleChange('budgetAmount', e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium" htmlFor="startDate">
            Data de início
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 font-medium" htmlFor="endDate">
            Quando a campanha termina?
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
          {isDateInvalid && (
            <p className="text-sm text-red-600 mt-1">
              A data de término não pode ser anterior à data de início.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignBudget;
