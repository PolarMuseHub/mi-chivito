export type TransactionType = 'ingreso' | 'gasto' | 'deuda' | 'ahorro';

export type ExpenseType = 'Esencial' | 'Deseo' | 'Obligatorio' | 'Variable';
export type ExpenseFrequency = 'Diario' | 'Semanal' | 'Catorcenal' | 'Quincenal' | 'Mensual' | 'Bimestral' | 'Semestral' | 'Anual' | 'Irregular' | 'Variable';

export type ExpenseSubcategory = {
  id: string;
  mainCategoryId: string;
  mainCategory: string;
  subcategory: string;
  examples: string[];
  frequency: ExpenseFrequency;
  type: ExpenseType;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
};

export type RecurrenceInterval = 'weekly' | 'biweekly' | 'bimonthly' | 'monthly';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category?: string;
  subcategoryId?: string;
  frequency?: ExpenseFrequency;
  date: Date;
  is_recurring?: boolean;
  recurrence_interval?: RecurrenceInterval;
  next_occurrence?: Date;
  parent_transaction_id?: string;
};

export type GoalType = 'Compra' | 'Viaje' | 'Deuda' | 'Vehículo' | 'Emergencias' | 'Otra';

export type FinancialGoal = {
  id: string;
  user_id: string;
  goal_name: string;
  goal_type: GoalType;
  target_amount: number;
  target_date: string | null;
  goal_reason: string | null;
  is_active: boolean;
  current_amount: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type FinanceState = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  getBalance: () => {
    total: number;
    ingresos: number;
    gastos: number;
    deudas: number;
    ahorros: number;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    loading: boolean;
  };
  toasts: Array<{ id: string; message: string }>;
  removeToast: (id: string) => void;
  checkStreak: () => Promise<void>;
};