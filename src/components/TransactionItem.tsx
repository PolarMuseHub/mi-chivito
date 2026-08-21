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
      year: 'numeric',
    }).format(new Date(date));
  };

  const getTypeStyles = () => {
    switch (transaction.type) {
      case 'ingreso':
        return {
          icon: '💰',
          bgColor: 'bg-[#E8F3EC]',
          textColor: 'text-[#2E7D5B]',
          amountPrefix: '+',
        };
      case 'gasto': {
        const category = transaction.category ? getCategoryById(transaction.category) : undefined;
        const subcategory = transaction.subcategoryId ? getSubcategoryById(transaction.subcategoryId) : undefined;
        const displayLabel = subcategory
          ? `${category?.name || ''} · ${subcategory.subcategory}`
          : category?.name;
        return {
          icon: category?.icon || '🛒',
          bgColor: 'bg-[#FDECE9]',
          textColor: 'text-[#E2523D]',
          amountPrefix: '-',
          label: displayLabel,
          subcategory: subcategory,
        };
      }
      case 'deuda':
        return {
          icon: '📝',
          bgColor: 'bg-[#FBF2E1]',
          textColor: 'text-[#C98A1E]',
          amountPrefix: '-',
        };
      case 'ahorro':
        return {
          icon: '🏦',
          bgColor: 'bg-[#FFF1E4]',
          textColor: 'text-orange-dark',
          amountPrefix: '+',
        };
      default:
        return {
          icon: '💲',
          bgColor: 'bg-[#FBF6F0]',
          textColor: 'text-[#241B14]',
          amountPrefix: '',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="bg-white rounded-[16px] p-3.5 flex items-center justify-between border border-[#F1E4D7] shadow-sm hover:border-orange/40 transition-all group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`${typeStyles.bgColor} w-11 h-11 rounded-[13px] flex items-center justify-center flex-shrink-0 text-xl`}>
          <span>{typeStyles.icon}</span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-[13.5px] text-[#241B14] truncate capitalize">
              {typeStyles.label || transaction.type}
            </p>
            {transaction.is_recurring && !transaction.parent_transaction_id && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FBF2E1] text-[#C98A1E]">
                <RefreshCw size={10} />
                {transaction.recurrence_interval === 'weekly' ? 'Semanal' :
                 transaction.recurrence_interval === 'biweekly' ? 'Catorcenal' :
                 transaction.recurrence_interval === 'bimonthly' ? 'Quincenal' : 'Mensual'}
              </span>
            )}
            {transaction.parent_transaction_id && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-gray-100 text-gray-600">
                <RefreshCw size={10} />
                Auto
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-[#8A7F72] mt-0.5">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <p className={`font-['Fraunces',serif] font-bold text-[15px] ${typeStyles.textColor}`}>
          {typeStyles.amountPrefix} {formatCurrency(transaction.amount)}
        </p>

        <button
          onClick={() => deleteTransaction(transaction.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-[#E2523D] hover:bg-[#FDECE9] transition-colors cursor-pointer"
          aria-label="Eliminar"
          title="Eliminar transacción"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;