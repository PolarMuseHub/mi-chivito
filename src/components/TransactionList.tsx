import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from './TransactionItem';
import { TransactionType } from '../types';

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

const TransactionList: React.FC = () => {
  const { transactions } = useFinance();
  const [activeFilter, setActiveFilter] = useState<FilterTab['id']>('todos');

  const filteredTransactions = transactions.filter(transaction =>
    activeFilter === 'todos' || transaction.type === activeFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mi Información</h2>
        <span className="text-sm text-gray-500">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-sage-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No hay transacciones para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;