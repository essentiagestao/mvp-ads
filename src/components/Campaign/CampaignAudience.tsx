import React from 'react';

export type AudienceData = {
  audienceId: string;
  gender: 'Todos' | 'Masculino' | 'Feminino';
  minAge?: number;
  maxAge?: number;
  location?: string;
};

type Props = {
  values: AudienceData;
  onChange: (values: AudienceData) => void;
};

const CampaignAudience: React.FC<Props> = ({ values, onChange }) => {
  const handleChange = (field: keyof AudienceData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const val =
      e.target.type === 'number' ? Number(e.target.value) || undefined : e.target.value;
    onChange({ ...values, [field]: val } as AudienceData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">ID do Público</label>
        <input
          type="text"
          required
          value={values.audienceId}
          onChange={handleChange('audienceId')}
          className="mt-1 p-2 border rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Gênero</label>
        <select
          value={values.gender}
          onChange={handleChange('gender')}
          className="mt-1 p-2 border rounded w-full"
        >
          <option value="Todos">Todos</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Idade mínima</label>
          <input
            type="number"
            min={0}
            value={values.minAge ?? ''}
            onChange={handleChange('minAge')}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Idade máxima</label>
          <input
            type="number"
            min={0}
            value={values.maxAge ?? ''}
            onChange={handleChange('maxAge')}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Localização</label>
        <input
          type="text"
          value={values.location ?? ''}
          onChange={handleChange('location')}
          className="mt-1 p-2 border rounded w-full"
        />
      </div>
    </div>
  );
};

export default CampaignAudience;
