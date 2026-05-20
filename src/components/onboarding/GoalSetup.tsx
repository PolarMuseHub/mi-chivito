import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-3xl w-full">
          <h2 className="text-2xl font-bold text-sage-900 mb-10 text-center leading-tight">
            ¿Para qué quiere chambear {chivitoName}?
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {GOAL_TYPES.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleTypeSelect(goal.id)}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all text-center border border-cream-200 hover:border-coral-500"
              >
                <span className="text-7xl mb-4 block">{goal.emoji}</span>
                <p className="font-bold text-sage-900 text-xl mb-2">{goal.text}</p>
                <p className="text-sm text-sage-500">{goal.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedGoalType = GOAL_TYPES.find(g => g.id === goalType);
  const actionVerb = goalType === 'purchase' ? 'comprar' : goalType === 'debt' ? 'pagar' : 'juntar';

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-sage-900 mb-6 text-center">
          ¿Qué quieres {actionVerb}?
        </h2>

        <div className="bg-white p-8 rounded-2xl shadow-sm mb-6 border border-cream-200">
          <div className="text-center mb-6">
            <span className="text-7xl">{selectedGoalType?.emoji}</span>
          </div>

          <div className="mb-6">
            <label className="block text-sage-800 font-medium mb-3 text-base">
              Nombre de tu meta:
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => {
                setGoalName(e.target.value);
                setError('');
              }}
              placeholder="Ej: Laptop, Pagar Coppel, XV años"
              className="w-full py-3 px-4 bg-white border border-cream-200 rounded-2xl focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 text-base transition-all placeholder:text-sage-400 shadow-sm"
              maxLength={100}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sage-800 font-medium mb-3 text-base">
              ¿Cuánto necesitas?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-sage-800 font-bold">$</span>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => {
                  setGoalAmount(e.target.value);
                  setError('');
                }}
                placeholder="7000"
                className="w-full py-4 pl-14 pr-4 bg-white border border-cream-200 rounded-2xl focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 text-3xl font-bold transition-all placeholder:text-sage-400 shadow-sm"
                min="1"
                step="1"
              />
            </div>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border-l-4 border-sage-600">
            <p className="text-sm text-sage-800 leading-relaxed">
              <span className="font-medium">💪 Tú pones el esfuerzo.</span> Yo te digo cuánto te falta y te echo porras para que llegues rápido.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-coral-50 border border-coral-200 text-coral-700 px-4 py-3 rounded-2xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!goalName.trim() || !goalAmount || isSubmitting}
          className="w-full bg-sage-600 text-white rounded-full px-6 py-3 font-medium hover:bg-sage-700 disabled:bg-sage-400 disabled:cursor-not-allowed transition-all shadow-sm mb-4"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          ) : (
            'Continuar'
          )}
        </button>

        <button
          onClick={() => setStep(1)}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full text-coral-500 hover:text-coral-600 font-medium transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={20} />
          Cambiar tipo de meta
        </button>
      </div>
    </div>
  );
};

export default GoalSetup;
