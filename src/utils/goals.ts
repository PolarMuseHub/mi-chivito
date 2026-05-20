import { supabase } from './supabase';
import { FinancialGoal, GoalType } from '../types';

export const GOAL_TYPES: { value: GoalType; label: string; icon: string }[] = [
  { value: 'Compra', label: 'Compra', icon: '🛍️' },
  { value: 'Viaje', label: 'Viaje', icon: '✈️' },
  { value: 'Deuda', label: 'Deuda', icon: '💳' },
  { value: 'Vehículo', label: 'Vehículo', icon: '🚗' },
  { value: 'Emergencias', label: 'Emergencias', icon: '🏥' },
  { value: 'Otra', label: 'Otra', icon: '🎯' },
];

export const createFinancialGoal = async (goalData: {
  goal_name: string;
  goal_type: GoalType;
  target_amount: number;
  target_date?: string;
  goal_reason?: string;
}): Promise<{ data: FinancialGoal | null; error: any }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return { data: null, error: { message: 'User not authenticated' } };
    }

    console.log('Creating goal for user:', user.id);
    console.log('Goal data:', goalData);

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        user_id: user.id,
        goal_name: goalData.goal_name,
        goal_type: goalData.goal_type,
        target_amount: goalData.target_amount,
        target_date: goalData.target_date || null,
        goal_reason: goalData.goal_reason || null,
        is_active: true,
        current_amount: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating financial goal:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { data: null, error };
    }

    console.log('Goal created successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception in createFinancialGoal:', error);
    return { data: null, error };
  }
};

export const getUserGoals = async (activeOnly = true): Promise<FinancialGoal[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial goals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserGoals:', error);
    return [];
  }
};

export const hasActiveGoal = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking for active goal:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasActiveGoal:', error);
    return false;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
