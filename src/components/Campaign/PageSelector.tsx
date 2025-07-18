import React from 'react';

interface PageSelectorProps {
  selectedPage: string;
  onChange: (page: string) => void;
}

const options = [
  { value: '', label: 'Selecione uma página' },
  { value: 'page-1', label: 'Página 1' },
  { value: 'page-2', label: 'Página 2' },
];

const PageSelector: React.FC<PageSelectorProps> = ({ selectedPage, onChange }) => (
  <div>
    <label className="block mb-1 font-medium" htmlFor="page">
      Página
    </label>
    <select
      id="page"
      value={selectedPage}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1 w-full"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default PageSelector;
