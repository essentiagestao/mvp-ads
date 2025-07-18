// src/components/Reports.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getInsights } from '../__legacy/mediaQueue-exports';

type InsightLevel = 'account' | 'campaign' | 'adset' | 'ad';

interface ApiAction {
  action_type: string;
  value: number;
}

interface ApiInsight {
  date_start: string;
  spend: number;
  clicks: number;
  actions: ApiAction[];
  [key: string]: any;
}

interface TransformedInsight {
  [key: string]: string | number;
}

const Reports: React.FC = () => {
  const [level, setLevel] = useState<InsightLevel>('ad');
  const [dates, setDates] = useState<{ since: string; until: string }>(() => {
    const until = new Date();
    const since = new Date();
    since.setDate(until.getDate() - 7);
    return {
      since: since.toISOString().split('T')[0],
      until: until.toISOString().split('T')[0],
    };
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransformedInsight[]>([]);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);

  const fetchAndProcessData = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getInsights(level, dates.since, dates.until);
      if (!raw.length) {
        toast.info('Nenhum dado encontrado para o período selecionado.');
        setData([]);
        setColumns([]);
        return;
      }
      const transformed = raw.map(row => {
        const { actions, ...rest } = row;
        const flat: TransformedInsight = { ...rest };
        actions.forEach(a => {
          flat[a.action_type] = a.value;
        });
        return flat;
      });
      setData(transformed);
      const keys = Object.keys(transformed[0]);
      setColumns(
        keys.map(k => ({
          key: k,
          label: k
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase()),
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar relatório.');
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, [level, dates]);

  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData]);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setDates(d => ({ ...d, [name]: value }));
    },
    []
  );

  return (
    <div className="reports-container">
      <h2>Relatórios de Performance</h2>

      <div className="filter-controls">
        <label>
          Desde
          <input
            type="date"
            name="since"
            value={dates.since}
            onChange={handleDateChange}
            disabled={loading}
          />
        </label>
        <label>
          Até
          <input
            type="date"
            name="until"
            value={dates.until}
            onChange={handleDateChange}
            disabled={loading}
          />
        </label>
        <label>
          Nível
          <select
            value={level}
            onChange={e => setLevel(e.target.value as InsightLevel)}
            disabled={loading}
          >
            <option value="account">Conta</option>
            <option value="campaign">Campanha</option>
            <option value="adset">Conjunto</option>
            <option value="ad">Anúncio</option>
          </select>
        </label>
        <button onClick={fetchAndProcessData} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      <div className="table-wrapper">
        {data.length ? (
          <table>
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {columns.map(c => (
                    <td key={c.key}>{row[c.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum dado disponível.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
