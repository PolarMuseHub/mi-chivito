import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from './TransactionItem';
import { TransactionType } from '../types';
import { Plus } from 'lucide-react';

interface FilterTab {
  id: TransactionType | 'todos';
  label: string;
}

const filterTabs: FilterTab[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'ingreso', label: 'Ingresos' },
  { id: 'gasto', label: 'Gastos' },
  { id: 'deuda', label: 'Deudas' },
  { id: 'ahorro', label: 'Ahorros' },
];

interface TransactionListProps {
  onNavigate?: (section: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onNavigate }) => {
  const { transactions } = useFinance();
  const [activeFilter, setActiveFilter] = useState<FilterTab['id']>('todos');

  const filteredTransactions = transactions.filter((transaction) =>
    activeFilter === 'todos' || transaction.type === activeFilter
  );

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Cabecera de la sección */}
      <div className="flex justify-between items-baseline mb-1">
        <h2 className="font-['Fraunces',serif] font-bold text-[22px] text-[#241B14]">
          Mi información
        </h2>
        <span className="text-[12.5px] font-bold text-[#8A7F72]">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* Píldoras de filtrado */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-[12.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-orange border-[1.5px] border-orange text-white shadow-sm'
                  : 'bg-white border-[1.5px] border-[#F1E4D7] text-[#8A7F72] hover:bg-[#FBF6F0]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Lista de transacciones o estado vacío */}
      <div className="space-y-3 pt-1">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          /* Estado Vacío de la maqueta (11_mi_informacion_transacciones.html) */
          <div className="bg-white rounded-[18px] p-8 text-center border border-[#F1E4D7] shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FFF1E4] text-orange-dark flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M8 10h8M8 14h5" />
              </svg>
            </div>
            <h3 className="text-[15px] font-extrabold text-[#241B14] mb-2">
              No hay transacciones para mostrar
            </h3>
            <p className="text-[12.5px] text-[#8A7F72] font-medium leading-relaxed max-w-[250px] mx-auto mb-5">
              Cuando registres tu primer movimiento, aparecerá aquí.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('nuevo')}
                className="inline-flex items-center gap-2 rounded-xl py-2.5 px-4 bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-extrabold text-[12.5px] shadow-md shadow-orange/30 hover:opacity-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Agregar movimiento</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;