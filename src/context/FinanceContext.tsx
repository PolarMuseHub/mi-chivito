import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, FinanceState, TransactionType } from '../types';
import { trackEvent, EVENTS } from '../utils/analytics';
import { processRecurringTransactions, calculateNextOccurrence } from '../utils/recurringTransactions';
import { calculateAndUpdateStreak, getStreakData } from '../utils/streakLogic';
import { supabase } from '../utils/supabase';

const FinanceContext = createContext<FinanceState | undefined>(undefined);

export const useFinance = (): FinanceState => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance debe ser usado dentro de un FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('miChivitoTransactions');
    return savedTransactions ? JSON.parse(savedTransactions).map((t: any) => ({
      ...t,
      date: new Date(t.date),
      next_occurrence: t.next_occurrence ? new Date(t.next_occurrence) : undefined
    })) : [];
  });

  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    loading: true
  });

  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  useEffect(() => {
    localStorage.setItem('miChivitoTransactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const checkRecurring = () => {
      setTransactions(prev => {
        const processed = processRecurringTransactions(prev);
        if (processed.length !== prev.length) {
          return processed;
        }
        return prev;
      });
    };

    checkRecurring();
    const interval = setInterval(checkRecurring, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkStreak();
  }, []);

  const checkStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStreakData({ currentStreak: 0, longestStreak: 0, loading: false });
        return;
      }

      const result = await calculateAndUpdateStreak(user.id);

      const data = await getStreakData(user.id);
      if (data) {
        setStreakData({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          loading: false
        });

        if (result.isIncrement) {
          const toastId = crypto.randomUUID();
          const message = `¡Día ${result.streak}! Estás dominando tus finanzas, Chivito! 🔥`;
          setToasts(prev => [...prev, { id: toastId, message }]);
        }
      } else {
        setStreakData({ currentStreak: 0, longestStreak: 0, loading: false });
      }
    } catch (error) {
      console.error('Error checking streak:', error);
      setStreakData({ currentStreak: 0, longestStreak: 0, loading: false });
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'> | Omit<Transaction, 'id' | 'date'>) => {
    const transactionDate = 'date' in transaction ? transaction.date : new Date();

    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transactionDate
    };

    if (transaction.is_recurring && transaction.recurrence_interval) {
      newTransaction.next_occurrence = calculateNextOccurrence(
        transactionDate,
        transaction.recurrence_interval
      );
    }

    setTransactions(prev => [newTransaction, ...prev]);

    trackEvent(EVENTS.TRANSACTION_ADDED, {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category
    });

    checkStreak();
  };

  // Eliminar transacción
  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Track event
      trackEvent(EVENTS.TRANSACTION_DELETED, {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category
      });
    }
  };

  // Calcular balance
  const getBalance = (startDate?: Date, endDate?: Date) => {
    let filteredTransactions = transactions;

    // Si se proporcionan fechas, filtrar las transacciones
    if (startDate || endDate) {
      filteredTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        if (startDate && endDate) {
          return transDate >= startDate && transDate <= endDate;
        } else if (startDate) {
          return transDate >= startDate;
        } else if (endDate) {
          return transDate <= endDate;
        }
        return true;
      });
    }

    const calculateTotal = (type: TransactionType) => {
      return filteredTransactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
    };

    const ingresos = calculateTotal('ingreso');
    const gastos = calculateTotal('gasto');
    const deudas = calculateTotal('deuda');
    const ahorros = calculateTotal('ahorro');

    // El balance es ingresos - gastos
    const total = ingresos - gastos;

    return {
      total,
      ingresos,
      gastos,
      deudas,
      ahorros
    };
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        getBalance,
        streakData,
        toasts,
        removeToast,
        checkStreak
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};