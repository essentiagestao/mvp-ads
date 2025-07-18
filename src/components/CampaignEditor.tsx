import React, {
  useState,
  useCallback,
  ChangeEvent,
  FormEvent
} from 'react';
import { toast } from 'react-toastify';
import {
  createCampaign,
  createAdSet,
  createAd
} from '../__legacy/mediaQueue-exports';

// Tipos
type CampaignObjective = 'LINK_CLICKS' | 'CONVERSIONS' | 'AWARENESS';
type BudgetType = 'DAILY' | 'LIFETIME';

interface CampaignFormData {
  campaignName: string;
  objective: CampaignObjective;
  audienceId: string;
  budgetType: BudgetType;
  budgetValue: number;
  creativeFiles: File[];
  creativeMessage: string;
}

const CampaignEditor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    campaignName: '',
    objective: 'LINK_CLICKS',
    audienceId: '',
    budgetType: 'DAILY',
    budgetValue: 10,
    creativeFiles: [],
    creativeMessage: '',
  });

  // Atualiza qualquer campo do form
  const handleChange = useCallback(
    (e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >) => {
      const { name, value, type, files } = e.target as HTMLInputElement;
      if (type === 'file' && files) {
        setFormData(prev => ({
          ...prev,
          creativeFiles: Array.from(files),
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]:
            e.target.type === 'number' ? parseFloat(value) : value,
        }));
      }
    },
    []
  );

  const handleNext = useCallback(() => {
    // Validations por passo
    if (currentStep === 1 && !formData.campaignName.trim()) {
      toast.error('Nome da campanha é obrigatório');
      return;
    }
    if (currentStep === 2 && !formData.audienceId.trim()) {
      toast.error('ID do público é obrigatório');
      return;
    }
    setCurrentStep(s => s + 1);
  }, [currentStep, formData]);

  const handleBack = useCallback(() => {
    setCurrentStep(s => Math.max(1, s - 1));
  }, []);

  const handleSaveDraft = useCallback(() => {
    // Poderia salvar em IndexedDB/localStorage
    toast.info('Campanha salva como rascunho local');
  }, []);

  const handlePublish = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      toast.info('Publicando campanha...');
      try {
        const campaignId = await createCampaign(
          formData.campaignName,
          formData.objective
        );
        const adSetId = await createAdSet(campaignId, formData.audienceId, {
          type: formData.budgetType,
          value: formData.budgetValue,
        });
        const adId = await createAd(
          adSetId,
          formData.creativeMessage,
          formData.creativeFiles
        );
        toast.success(
          `Campanha criada (${campaignId}), Anúncio: ${adId}`
        );
        // Reset
        setCurrentStep(1);
        setFormData({
          campaignName: '',
          objective: 'LINK_CLICKS',
          audienceId: '',
          budgetType: 'DAILY',
          budgetValue: 10,
          creativeFiles: [],
          creativeMessage: '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Erro ao publicar campanha');
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  return (
    <div className="campaign-editor" role="form" aria-labelledby="wizard-title">
      <h2 id="wizard-title">Criação de Campanha</h2>
      <form onSubmit={handlePublish}>
        {currentStep === 1 && (
          <section aria-label="Passo 1: Informações Gerais">
            <h3>Passo 1: Informações Gerais</h3>
            <label>
              Nome da Campanha*
              <input
                type="text"
                name="campaignName"
                value={formData.campaignName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Objetivo
              <select
                name="objective"
                value={formData.objective}
                onChange={handleChange}
              >
                <option value="LINK_CLICKS">Cliques no Link</option>
                <option value="CONVERSIONS">Conversões</option>
                <option value="AWARENESS">Reconhecimento</option>
              </select>
            </label>
          </section>
        )}

        {currentStep === 2 && (
          <section aria-label="Passo 2: Público">
            <h3>Passo 2: Público</h3>
            <label>
              ID do Público*
              <input
                type="text"
                name="audienceId"
                value={formData.audienceId}
                onChange={handleChange}
                placeholder="Ex: 602198..."
                required
              />
            </label>
          </section>
        )}

        {currentStep === 3 && (
          <section aria-label="Passo 3: Orçamento">
            <h3>Passo 3: Orçamento e Programação</h3>
            <fieldset>
              <legend>Tipo de Orçamento</legend>
              <label>
                <input
                  type="radio"
                  name="budgetType"
                  value="DAILY"
                  checked={formData.budgetType === 'DAILY'}
                  onChange={handleChange}
                />
                Diário
              </label>
              <label>
                <input
                  type="radio"
                  name="budgetType"
                  value="LIFETIME"
                  checked={formData.budgetType === 'LIFETIME'}
                  onChange={handleChange}
                />
                Vitalício
              </label>
            </fieldset>
            <label>
              Valor (R$)*
              <input
                type="number"
                name="budgetValue"
                value={formData.budgetValue}
                onChange={handleChange}
                min={1}
                required
              />
            </label>
          </section>
        )}

        {currentStep === 4 && (
          <section aria-label="Passo 4: Criativos">
            <h3>Passo 4: Criativos</h3>
            <label>
              Imagens/Vídeos
              <input
                type="file"
                name="creativeFiles"
                onChange={handleChange}
                multiple
                accept="image/*,video/*"
                required
              />
            </label>
            <label>
              Texto Principal (CTA)
              <textarea
                name="creativeMessage"
                value={formData.creativeMessage}
                onChange={handleChange}
                rows={4}
              />
            </label>
          </section>
        )}

        <div className="wizard-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="button secondary"
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="button secondary"
          >
            Salvar Rascunho
          </button>
          {currentStep < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="button primary"
            >
              Próximo
            </button>
          )}
          {currentStep === 4 && (
            <button
              type="submit"
              className="button primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Publicando...' : 'Publicar Campanha'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CampaignEditor;
