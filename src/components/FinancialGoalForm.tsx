import React, { useState } from 'react';
import { Target, Calendar } from 'lucide-react';
import { GoalType } from '../types';
import { createFinancialGoal } from '../utils/goals';

interface FinancialGoalFormProps {
  onSuccess?: () => void;
}

const GOAL_OPTIONS: {
  value: GoalType;
  label: string;
  iconColorClass: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'Compra',
    label: 'Compra',
    iconColorClass: 'bg-[#E9EFFC] text-[#3B6FE0]',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2l1.5 3M18 2l-1.5 3" />
        <path d="M4 8h16l-1.2 11a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 8z" />
      </svg>
    ),
  },
  {
    value: 'Viaje',
    label: 'Viaje',
    iconColorClass: 'bg-[#F0ECFB] text-[#7C5CD6]',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 21l1-7-8-2 18-9-6 18-3-6-6 6z" />
      </svg>
    ),
  },
  {
    value: 'Deuda',
    label: 'Deuda',
    iconColorClass: 'bg-[#FBF2E1] text-[#C98A1E]',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="13" rx="2.5" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    value: 'Vehículo',
    label: 'Vehículo',
    iconColorClass: 'bg-[#FDECE9] text-[#E2523D]',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13l2-6h14l2 6M5 13h14v5H5z" />
        <circle cx="7.5" cy="18" r="1.4" />
        <circle cx="16.5" cy="18" r="1.4" />
      </svg>
    ),
  },
  {
    value: 'Emergencias',
    label: 'Emergencias',
    iconColorClass: 'bg-[#F0ECFB] text-[#7C5CD6]',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V6l8-3z" />
        <path d="M12 8v6M9 11h6" />
      </svg>
    ),
  },
  {
    value: 'Otra',
    label: 'Otra',
    iconColorClass: 'bg-[#FBEAF1] text-[#D6467E]',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
  },
];

const FinancialGoalForm: React.FC<FinancialGoalFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_type: '' as GoalType | '',
    target_amount: '',
    target_date: '',
    goal_reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.goal_name.trim()) {
      setError('Por favor ingresa el nombre de tu meta');
      return;
    }

    if (!formData.goal_type) {
      setError('Por favor selecciona el tipo de meta');
      return;
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setIsSubmitting(true);

    const { data, error: apiError } = await createFinancialGoal({
      goal_name: formData.goal_name.trim(),
      goal_type: formData.goal_type,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date || undefined,
      goal_reason: formData.goal_reason.trim() || undefined,
    });

    setIsSubmitting(false);

    if (apiError || !data) {
      const errorMessage = apiError?.message || apiError?.hint || 'Error desconocido';
      console.error('Form submission error:', apiError);

      if (apiError?.code === '42P01') {
        setError('La tabla de metas no existe. Por favor contacta al soporte.');
      } else if (apiError?.code === '42501') {
        setError('No tienes permisos para crear metas. Verifica tu sesión.');
      } else if (apiError?.message?.includes('relation') && apiError?.message?.includes('does not exist')) {
        setError('La base de datos necesita configuración. Consulta FINANCIAL_GOALS_MIGRATION.md');
      } else {
        setError(`Error: ${errorMessage}`);
      }
      return;
    }

    setShowSuccess(true);

    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      }
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="bg-white border border-[#F1E4D7] rounded-[22px] p-8 text-center max-w-sm w-full shadow-xl shadow-black/10 animate-fade-in">
          <span className="text-5xl mb-3 block">🎉</span>
          <h3 className="font-['Fraunces',serif] text-[20px] font-bold text-[#241B14] mb-2">
            ¡Tu meta está lista!
          </h3>
          <p className="text-[12.5px] text-[#8A7F72] font-medium mb-6 leading-relaxed">
            Cada peso que registres ahora suma directo a "{formData.goal_name || 'tu meta'}".
          </p>
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-orange text-white font-extrabold text-[13.5px] hover:bg-orange-dark transition-colors shadow-md shadow-orange/20 cursor-pointer"
          >
            Ver mi meta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-[18px] p-6 border border-[#F1E4D7] shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[#E8F3EC] text-[#2E7D5B] flex items-center justify-center mx-auto mb-4">
          <svg className="w-[30px] h-[30px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1" />
          </svg>
        </div>

        <h2 className="font-['Fraunces',serif] font-bold text-[23px] text-[#241B14] leading-tight mb-2">
          ¿Para qué quieres que trabaje tu Chivito?
        </h2>
        <p className="text-[13px] text-[#8A7F72] font-medium mb-6 leading-relaxed max-w-[270px] mx-auto">
          No tiene que ser perfecto. Solo algo que valga la pena cuidar.
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-5">
          <div>
            <label className="flex items-center gap-1 text-[12.5px] font-bold text-[#241B14] mb-2">
              Nombre de tu meta <span className="text-[#E2523D]">*</span>
            </label>
            <div className="input-wrap">
              <input
                type="text"
                value={formData.goal_name}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                placeholder="Ej. Cambiar mi celular · Viajar · Pagar"
                className="w-full text-sm font-semibold text-[#241B14] placeholder-[#C4B9AA]"
                maxLength={100}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[12.5px] font-bold text-[#241B14] mb-2">
              ¿Para qué es esta meta? <span className="text-[#E2523D]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map((type) => {
                const isSelected = formData.goal_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal_type: type.value })}
                    className={`
                      flex items-center gap-2.5 border-[1.5px] rounded-[13px] p-3 text-left transition-all cursor-pointer
                      ${
                        isSelected
                          ? 'border-orange bg-[#FFF1E4]'
                          : 'border-[#F1E4D7] bg-white hover:bg-[#FBF6F0]'
                      }
                    `}
                  >
                    <div className={`w-[30px] h-[30px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${type.iconColorClass}`}>
                      {type.icon}
                    </div>
                    <span className="text-[12.5px] font-bold text-[#241B14]">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[12.5px] font-bold text-[#241B14] mb-2">
              ¿Cuánto dinero necesitas en total? <span className="text-[#E2523D]">*</span>
            </label>
            <div className="input-wrap">
              <span className="text-[17px] font-extrabold text-orange-dark mr-1">$</span>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="Ej. 12000"
                className="w-full text-sm font-semibold text-[#241B14] placeholder-[#C4B9AA]"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-[11px] text-[#8A7F72] font-semibold mt-1.5">
              Puedes cambiar este monto después.
            </p>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#241B14] mb-2">
              ¿Para cuándo te gustaría lograrlo?
            </label>
            <div className="input-wrap">
              <Calendar className="w-4 h-4 text-[#B7AB9C] flex-shrink-0" />
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full text-sm font-semibold text-[#241B14] placeholder-[#C4B9AA]"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-[11px] text-[#8A7F72] font-semibold mt-1.5">Opcional</p>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-[#241B14] mb-2">
              ¿Por qué es importante para ti?
            </label>
            <div className="input-wrap !items-start">
              <textarea
                value={formData.goal_reason}
                onChange={(e) => setFormData({ ...formData, goal_reason: e.target.value })}
                placeholder="Ej. Para viajar sin preocuparme por dinero."
                rows={3}
                className="w-full text-sm font-medium text-[#241B14] placeholder-[#C4B9AA] resize-none leading-relaxed"
                maxLength={500}
              />
            </div>
            <p className="text-[11px] text-[#8A7F72] font-semibold mt-1.5">Opcional</p>
          </div>

          {error && (
            <div className="bg-[#FDECE9] border border-[#FBD1C9] text-[#E2523D] text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-[15px] py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange/30 hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-b from-[#FF8A42] to-[#E2610F] mt-6 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando tu meta...</span>
              </>
            ) : (
              <>
                <Target size={18} />
                <span>Crear mi meta</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialGoalForm;
