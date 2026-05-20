import { Transaction, RecurrenceInterval } from '../types';

export const calculateNextOccurrence = (
  currentDate: Date,
  interval: RecurrenceInterval
): Date => {
  const nextDate = new Date(currentDate);

  if (interval === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (interval === 'biweekly') {
    nextDate.setDate(nextDate.getDate() + 14);
  } else if (interval === 'bimonthly') {
    nextDate.setDate(nextDate.getDate() + 15);
  } else if (interval === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
};

export const shouldGenerateRecurrence = (transaction: Transaction): boolean => {
  if (!transaction.is_recurring || !transaction.next_occurrence) {
    return false;
  }

  const now = new Date();
  const nextOccurrence = new Date(transaction.next_occurrence);

  return now >= nextOccurrence;
};

export const generateRecurringTransaction = (
  parentTransaction: Transaction
): Transaction => {
  const now = new Date();

  const newTransaction: Transaction = {
    ...parentTransaction,
    id: crypto.randomUUID(),
    date: now,
    parent_transaction_id: parentTransaction.id,
    is_recurring: false,
  };

  delete newTransaction.next_occurrence;
  delete newTransaction.recurrence_interval;

  return newTransaction;
};

export const updateParentNextOccurrence = (
  transaction: Transaction
): Transaction => {
  if (!transaction.is_recurring || !transaction.recurrence_interval) {
    return transaction;
  }

  const nextOccurrence = calculateNextOccurrence(
    transaction.next_occurrence || transaction.date,
    transaction.recurrence_interval
  );

  return {
    ...transaction,
    next_occurrence: nextOccurrence,
  };
};

export const processRecurringTransactions = (
  transactions: Transaction[]
): Transaction[] => {
  const recurringTransactions = transactions.filter(
    t => t.is_recurring && !t.parent_transaction_id
  );

  const newTransactions: Transaction[] = [];
  const updatedTransactions: Transaction[] = [...transactions];

  recurringTransactions.forEach(parent => {
    if (shouldGenerateRecurrence(parent)) {
      const newTransaction = generateRecurringTransaction(parent);
      newTransactions.push(newTransaction);

      const parentIndex = updatedTransactions.findIndex(t => t.id === parent.id);
      if (parentIndex !== -1) {
        updatedTransactions[parentIndex] = updateParentNextOccurrence(parent);
      }
    }
  });

  if (newTransactions.length > 0) {
    return [...newTransactions, ...updatedTransactions];
  }

  return updatedTransactions;
};
