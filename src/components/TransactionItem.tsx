import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { Transaction } from '../types';
import { getCategoryById, getSubcategoryById } from '../utils/categories';
import { useFinance } from '../context/FinanceContext';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { deleteTransaction } = useFinance();
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-419', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTypeStyles = () => {
    switch (transaction.type) {
      case 'ingreso':
        return { icon: '💰', bgColor: 'bg-sage-100', textColor: 'text-gray-800' };
      case 'gasto': {
        const category = transaction.category ? getCategoryById(transaction.category) : undefined;
        const subcategory = transaction.subcategoryId ? getSubcategoryById(transaction.subcategoryId) : undefined;
        const displayLabel = subcategory
          ? `${category?.name || ''} - ${subcategory.subcategory}`
          : category?.name;
        return {
          icon: category?.icon || '🛒',
          bgColor: 'bg-coral-100',
          textColor: 'text-gray-800',
          label: displayLabel,
          subcategory: subcategory
        };
      }
      case 'deuda':
        return { icon: '📝', bgColor: 'bg-cream-200', textColor: 'text-gray-800' };
      case 'ahorro':
        return { icon: '🏦', bgColor: 'bg-sage-100', textColor: 'text-gray-800' };
      default:
        return { icon: '💲', bgColor: 'bg-cream-100', textColor: 'text-gray-800' };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="bg-cream-50 rounded-lg p-4 flex items-center justify-between transition-all hover:bg-cream-100 border border-cream-200">
      <div className="flex items-center space-x-4">
        <div className={`${typeStyles.bgColor} p-3 rounded-full`}>
          <span className="text-xl">{typeStyles.icon}</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium capitalize text-gray-800">{transaction.type}</p>
            {transaction.is_recurring && !transaction.parent_transaction_id && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sage-100 text-sage-700">
                <RefreshCw size={12} />
                {transaction.recurrence_interval === 'weekly' ? 'Semanal' :
                 transaction.recurrence_interval === 'biweekly' ? 'Catorcenal' :
                 transaction.recurrence_interval === 'bimonthly' ? 'Quincenal' : 'Mensual'}
              </span>
            )}
            {transaction.parent_transaction_id && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <RefreshCw size={12} />
                Auto
              </span>
            )}
          </div>
          {typeStyles.label && (
            <p className="text-sm text-gray-600">{typeStyles.label}</p>
          )}
          {typeStyles.subcategory && (
            <p className="text-xs text-gray-500">
              {typeStyles.subcategory.type} • {typeStyles.subcategory.frequency}
            </p>
          )}
          <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <p className={`font-bold ${typeStyles.textColor}`}>
          {formatCurrency(transaction.amount)}
        </p>

        <button
          onClick={() => deleteTransaction(transaction.id)}
          className="p-1.5 rounded-full hover:bg-coral-200 transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 size={18} className="text-gray-500 hover:text-coral-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;