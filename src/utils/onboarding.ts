import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  chivito_name: string | null;
  chivito_accessories: string[];
  income_frequency: string | null;
  savings_location: string | null;
  spending_attitude: string | null;
  money_leak: string | null;
  emergency_fund: boolean | null;
  savings_goal_type: string | null;
  savings_goal_name: string | null;
  savings_goal_amount: number | null;
  risk_level: string | null;
  impulsivity_score: number;
  created_at: string;
  updated_at: string;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const createUserProfile = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        onboarding_completed: false,
        impulsivity_score: 1
      });

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return false;
  }
};

export const updateChivitoCustomization = async (
  chivitoName: string,
  accessories: string[]
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        chivito_name: chivitoName,
        chivito_accessories: accessories,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating Chivito customization:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateChivitoCustomization:', error);
    return false;
  }
};

export const updateProfileAnswers = async (answers: {
  income_frequency: string;
  savings_location: string;
  spending_attitude: string;
  money_leak: string;
  emergency_fund: boolean;
}): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    let impulsivity_score = 1;
    if (answers.spending_attitude === 'foodie' || answers.spending_attitude === 'impulsive') {
      impulsivity_score = 3;
    } else if (answers.spending_attitude === 'responsible_payer') {
      impulsivity_score = 2;
    }

    let risk_level = 'low';
    if (answers.savings_location === 'wallet' || !answers.emergency_fund) {
      risk_level = 'high';
    } else if (answers.income_frequency === 'sporadic') {
      risk_level = 'medium';
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...answers,
        risk_level,
        impulsivity_score,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile answers:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProfileAnswers:', error);
    return false;
  }
};

export const updateGoalInfo = async (
  goalType: string,
  goalName: string,
  goalAmount: number
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        savings_goal_type: goalType,
        savings_goal_name: goalName,
        savings_goal_amount: goalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error updating goal info:', profileError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateGoalInfo:', error);
    return false;
  }
};

export const completeOnboarding = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    return false;
  }
};

export const GOAL_TYPES = [
  { id: 'purchase', emoji: '🛍️', text: 'Comprar algo', subtitle: 'Celular, Laptop, Ropa' },
  { id: 'debt', emoji: '💳', text: 'Pagar una deuda', subtitle: 'Coppel, Elektra, Al compadre' },
  { id: 'event', emoji: '🎉', text: 'Juntar para un evento', subtitle: 'XV años, Boda, Viaje' },
  { id: 'emergency', emoji: '🆘', text: 'Tener colchón', subtitle: 'Emergencias' }
];
