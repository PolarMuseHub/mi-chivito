import React, { useState } from 'react';
import { Target, Check } from 'lucide-react';
import { GoalType } from '../types';
import { createFinancialGoal, GOAL_TYPES } from '../utils/goals';

interface FinancialGoalFormProps {
  onSuccess?: () => void;
}

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={40} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Meta creada</h2>
            <p className="text-lg text-gray-600">
              Tu Chivito ya tiene algo que proteger 🐐
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-sage-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¿Para qué quieres que trabaje tu Chivito?
          </h1>
          <p className="text-gray-600">
            No tiene que ser perfecto. Solo algo que valga la pena cuidar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de tu meta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.goal_name}
              onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
              placeholder="Ej. Cambiar mi celular · Viajar · Pagar una deuda · Comprar un carro"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Para qué es esta meta? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GOAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal_type: type.value })}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all
                    flex items-center justify-center gap-2 text-sm font-medium
                    ${
                      formData.goal_type === type.value
                        ? 'border-sage-500 bg-sage-50 text-sage-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cuánto dinero necesitas en total? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="Ej. 12000"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Puedes cambiar este monto después.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Para cuándo te gustaría lograrlo?
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all"
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-sm text-gray-500 mt-1">Opcional</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Por qué es importante para ti?
            </label>
            <textarea
              value={formData.goal_reason}
              onChange={(e) => setFormData({ ...formData, goal_reason: e.target.value })}
              placeholder="Ej. Para viajar sin preocuparme por dinero."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all resize-none"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">Opcional</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creando tu meta...
              </>
            ) : (
              <>
                <Target size={20} />
                Crear mi meta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialGoalForm;
