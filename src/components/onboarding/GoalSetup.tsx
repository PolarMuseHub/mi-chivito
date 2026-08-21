import React, { useState } from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { GOAL_TYPES, updateGoalInfo } from '../../utils/onboarding';
import { createFinancialGoal } from '../../utils/goals';
import { GoalType } from '../../types';
import { supabase } from '../../utils/supabase';

interface GoalSetupProps {
  chivitoName: string;
  onContinue: () => void;
}

const GoalSetup: React.FC<GoalSetupProps> = ({ chivitoName, onContinue }) => {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const GOAL_TYPE_MAP: Record<string, string> = {
    purchase: 'comprar',
    debt: 'deuda',
    event: 'evento',
    emergency: 'colchon',
  };

  const handleTypeSelect = (type: string) => {
    setGoalType(type);
    setStep(2);

    const mapped = GOAL_TYPE_MAP[type];
    if (mapped) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        supabase
          .from('onboarding_responses')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }) => {
            if (!data) return;
            supabase
              .from('onboarding_responses')
              .update({ goal_type: mapped })
              .eq('id', data.id)
              .then(() => {});
          });
      });
    }
  };

  const handleSubmit = async () => {
    if (!goalName.trim() || !goalAmount) {
      setError('Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(goalAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setIsSubmitting(true);

    const profileSuccess = await updateGoalInfo(goalType, goalName, amount);

    if (profileSuccess) {
      const goalTypeMap: Record<string, GoalType> = {
        purchase: 'Compra',
        debt: 'Deuda',
        event: 'Viaje',
        emergency: 'Emergencias'
      };

      await createFinancialGoal({
        goal_name: goalName,
        goal_type: goalTypeMap[goalType] || 'Otra',
        target_amount: amount
      });

      setIsSubmitting(false);
      onContinue();
    } else {
      setIsSubmitting(false);
      setError('Error al guardar. Intenta de nuevo.');
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-5 sm:p-6 animate-fade-in">
        <div className="max-w-[520px] w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8" />
            <div className="w-8" />
          </div>

          <h2 className="font-['Fraunces',serif] text-[23px] font-bold text-[#241B14] leading-tight mb-5 text-center">
            ¿Para qué quiere chambear <span className="text-orange-dark">{chivitoName}</span>?
          </h2>

          <div className="space-y-[11px]">
            {GOAL_TYPES.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleTypeSelect(goal.id)}
                className="group w-full flex items-center gap-[13px] bg-white border-[1.5px] border-[#F1E4D7] rounded-2xl p-3.5 text-left transition-all hover:border-orange active:scale-[.98]"
              >
                <span
                  className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 text-xl"
                  style={{ backgroundColor: goal.id === 'purchase' ? '#E9EFFC' : goal.id === 'debt' ? '#FBF2E1' : goal.id === 'event' ? '#FBEAF1' : '#FDECE9' }}
                >
                  {goal.emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-extrabold text-[#241B14] leading-tight">{goal.text}</span>
                  <span className="block text-[11.5px] text-[#8A7F72] font-semibold mt-0.5">{goal.subtitle}</span>
                </span>
                <span className="w-[22px] h-[22px] rounded-full border-2 border-[#D8CBB9] shrink-0 group-hover:border-orange" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedGoalType = GOAL_TYPES.find(g => g.id === goalType);
  const actionVerb = goalType === 'purchase' ? 'comprar' : goalType === 'debt' ? 'pagar' : 'juntar';
  const goalIconBackground = goalType === 'purchase' ? '#E9EFFC' : goalType === 'debt' ? '#FBF2E1' : goalType === 'event' ? '#FBEAF1' : '#FDECE9';

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-5 sm:p-6 animate-fade-in">
      <div className="max-w-[520px] w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white border border-[#F1E4D7] flex items-center justify-center text-[#241B14] disabled:opacity-50"
            aria-label="Regresar"
          >
            <ChevronLeft size={15} />
          </button>
          <div className="w-8" />
        </div>

        <h2 className="font-['Fraunces',serif] text-[23px] font-bold text-[#241B14] leading-tight mb-5 text-center">
          ¿Qué quieres {actionVerb}?
        </h2>

        <div className="flex items-center gap-3 bg-white border border-[#F1E4D7] rounded-[14px] p-3 mb-[18px] opacity-60">
          <span className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base" style={{ backgroundColor: goalIconBackground }}>
            {selectedGoalType?.emoji}
          </span>
          <div>
            <div className="text-[10.5px] font-extrabold text-[#8A7F72] uppercase tracking-[.04em]">Tipo de meta</div>
            <div className="text-[13.5px] font-bold text-[#241B14]">{selectedGoalType?.text}</div>
          </div>
        </div>

        <div className="w-full text-left">
          <div className="text-[12.5px] font-bold text-[#241B14] mb-2">Nombre de tu meta:</div>
          <input
            type="text"
            value={goalName}
            onChange={(e) => {
              setGoalName(e.target.value);
              setError('');
            }}
            placeholder="Ej: Laptop, Pagar Coppel, XV años"
            className="w-full bg-[#FBF6F0] border-[1.5px] border-[#F1E4D7] rounded-[14px] py-3 px-3.5 font-sans text-[14.5px] font-semibold text-[#241B14] outline-none focus:bg-white focus:border-orange focus:ring-4 focus:ring-orange-light placeholder:text-[#C4B9AA] placeholder:font-medium transition-all"
            maxLength={100}
          />

          <div className="text-[12.5px] font-bold text-[#241B14] mb-2 mt-[18px]">¿Cuánto necesitas?</div>
          <div className="flex items-center gap-2 bg-[#FBF6F0] border-[1.5px] border-[#F1E4D7] rounded-[14px] py-3 px-3.5 focus-within:bg-white focus-within:border-orange focus-within:ring-4 focus-within:ring-orange-light">
            <span className="font-['Fraunces',serif] text-xl font-bold text-orange-dark">$</span>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => {
                setGoalAmount(e.target.value);
                setError('');
              }}
              placeholder="7000"
              className="w-full border-none outline-none bg-transparent font-['Fraunces',serif] text-xl font-bold text-[#241B14] placeholder:text-[#C4B9AA]"
              min="1"
              step="1"
            />
          </div>

          <div className="flex gap-2.5 bg-[#FFF8F2] border-l-[3px] border-orange rounded-xl py-[13px] px-3.5 mt-5">
            <span className="text-[17px] shrink-0">💪</span>
            <p className="text-xs text-[#8A7F72] font-semibold leading-[1.5] text-left"><strong className="text-[#241B14]">Tú pones el esfuerzo.</strong> Yo te digo cuánto te falta y te echo porras para que llegues rápido.</p>
          </div>
        </div>

        {error && (
          <div className="bg-coral-50 border border-coral-200 text-coral-700 px-4 py-3 rounded-xl mt-4 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!goalName.trim() || !goalAmount || isSubmitting}
          className="w-full border-none rounded-[14px] py-[15px] mt-5 bg-gradient-to-b from-[#FF8A42] via-orange to-orange-dark text-white font-sans font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_14px_24px_-10px_rgba(226,97,15,.65)] disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          ) : (
            <>Continuar <ArrowRight size={18} /></>
          )}
        </button>

        <button
          onClick={() => setStep(1)}
          disabled={isSubmitting}
          className="block w-full text-center text-[12.5px] font-bold text-orange-dark mt-4 disabled:opacity-50"
        >
          ‹ Cambiar tipo de meta
        </button>
      </div>
    </div>
  );
};

export default GoalSetup;
