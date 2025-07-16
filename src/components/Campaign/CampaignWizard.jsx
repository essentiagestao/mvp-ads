import { useState } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  "Objetivo",
  "Público",
  "Orçamento",
  "Criativo",
  "Confirmação"
];

export default function CampaignWizard() {
  const [step, setStep] = useState(0);

  const next = () => step < steps.length - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        {steps.map((s, index) => (
          <div
            key={s}
            className={`text-sm text-center flex-1 transition-all ${
              index === step
                ? "font-bold text-black"
                : "text-gray-400"
            }`}
          >
            <div className={`mb-1 w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
              index === step ? "bg-black text-white" : "bg-gray-200"
            }`}>
              {index + 1}
            </div>
            {s}
          </div>
        ))}
      </div>

      <div className="border rounded-2xl p-6 shadow-sm">
        {step === 0 && <div>\u2728 Escolha o objetivo da sua campanha</div>}
        {step === 1 && <div>\ud83d\udcc8 Defina o público-alvo</div>}
        {step === 2 && <div>\ud83d\udcb8 Configure orçamento e datas</div>}
        {step === 3 && <div>\ud83d\udcf8 Crie o criativo do anúncio</div>}
        {step === 4 && <div>\ud83d\ude80 Revise e confirme o envio</div>}
      </div>

      <div className="mt-6 flex justify-between">
        <Button onClick={prev} disabled={step === 0} variant="outline">
          Voltar
        </Button>
        <Button onClick={next} disabled={step === steps.length - 1}>
          Avançar
        </Button>
      </div>
    </div>
  );
}
