import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { expenseCategories, expenseSubcategories, getSubcategoriesByMainCategory } from '../utils/categories';
import { TransactionType, ExpenseFrequency, RecurrenceInterval } from '../types';
import { Calendar, RefreshCw } from 'lucide-react';
import TicketScanner from './TicketScanner';

type TabsType = {
  id: TransactionType;
  label: string;
  color: string;
};

const tabs: TabsType[] = [
  { id: 'ingreso', label: 'Ingreso', color: '#728c6a' },
  { id: 'gasto', label: 'Gasto', color: 'bg-red-500' },
  { id: 'deuda', label: 'Deuda', color: 'bg-orange-500' },
  { id: 'ahorro', label: 'Ahorro', color: 'bg-sage-500' },
];

const frequencyOptions: ExpenseFrequency[] = [
  'Diario',
  'Semanal',
  'Catorcenal',
  'Quincenal',
  'Mensual',
  'Bimestral',
  'Semestral',
  'Anual',
  'Irregular',
  'Variable'
];

const AddTransactionForm: React.FC = () => {
  const { addTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState<TransactionType>('ingreso');
  const [amount, setAmount] = useState<string>('');
  const [mainCategory, setMainCategory] = useState<string>(expenseCategories[0].id);
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [frequency, setFrequency] = useState<ExpenseFrequency>('Mensual');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    today.setFullYear(2026);
    return today.toISOString().split('T')[0];
  });
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('monthly');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableSubcategories = useMemo(() => {
    return getSubcategoriesByMainCategory(mainCategory);
  }, [mainCategory]);

  React.useEffect(() => {
    if (availableSubcategories.length > 0) {
      setSubcategoryId(availableSubcategories[0].id);
    }
  }, [availableSubcategories]);

  const handleTicketDataExtracted = (data: any) => {
    setAmount('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setMainCategory('AB');
    setSubcategoryId('');
    setFrequency('Mensual');
    setIsRecurring(false);
    setRecurrenceInterval('monthly');

    setActiveTab('gasto');
    setAmount(data.monto_total?.toString() || '');
    if (data.fecha) setSelectedDate(data.fecha);
    if (data.mainCategoryId) {
      setMainCategory(data.mainCategoryId);
    }
    if (data.subcategoria_id) {
      setSubcategoryId(data.subcategoria_id);
    } else if (data.mainCategoryId) {
      const subs = getSubcategoriesByMainCategory(data.mainCategoryId);
      if (subs.length > 0) setSubcategoryId(subs[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);

    const transaction = {
      type: activeTab,
      amount: parseFloat(amount),
      date: new Date(selectedDate),
      ...(activeTab === 'gasto' && {
        category: mainCategory,
        subcategoryId: subcategoryId,
        frequency: frequency
      }),
      is_recurring: isRecurring,
      ...(isRecurring && { recurrence_interval: recurrenceInterval }),
    };

    addTransaction(transaction);
    setAmount('');
    setMainCategory(expenseCategories[0].id);
    setFrequency('Mensual');
    setIsRecurring(false);
    setRecurrenceInterval('monthly');

    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Registro</h2>

      <TicketScanner onDataExtracted={handleTicketDataExtracted} />

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-sage-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto (MXN)
          </label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 p-3 border border-gray-300 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
              required
            />
          </div>
        </div>

        <div className="border border-sage-200 rounded-lg p-4 bg-sage-50">
          <div className="flex items-center gap-3 mb-3">
            <input
              id="isRecurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
            />
            <label htmlFor="isRecurring" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <RefreshCw size={16} className="text-sage-600" />
              Transacción Recurrente
            </label>
          </div>

          {isRecurring && (
            <div className="mt-3">
              <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Repetición
              </label>
              <select
                id="recurrenceInterval"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
              >
                <option value="weekly">Semanal (cada 7 días)</option>
                <option value="biweekly">Catorcenal (cada 14 días)</option>
                <option value="bimonthly">Quincenal (cada 15 días)</option>
                <option value="monthly">Mensual (mismo día cada mes)</option>
              </select>
              <p className="mt-2 text-xs text-gray-600">
                Esta transacción se repetirá automáticamente según la frecuencia seleccionada.
              </p>
            </div>
          )}
        </div>

        {activeTab === 'gasto' && (
          <>
            <div>
              <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría Principal
              </label>
              <select
                id="mainCategory"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
                required
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Categoría
              </label>
              <select
                id="subcategory"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
                required
              >
                {availableSubcategories.map((subcat) => (
                  <option key={subcat.id} value={subcat.id}>
                    {subcat.subcategory}
                  </option>
                ))}
              </select>
              {availableSubcategories.find(s => s.id === subcategoryId)?.examples.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Ej: {availableSubcategories.find(s => s.id === subcategoryId)?.examples.slice(0, 3).join(', ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as ExpenseFrequency)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
                  required
                >
                  {frequencyOptions.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <input
                  id="tipo"
                  type="text"
                  value={availableSubcategories.find(s => s.id === subcategoryId)?.type || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
            isSubmitting ? 'opacity-70' : 'hover:opacity-90'
          } bg-sage-500 hover:bg-sage-600`}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;