import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Subscription {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_start: string | null;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  checkoutLoading: boolean;
  hasActiveAccess: boolean;
  isPremium: boolean;
  daysLeftInTrial: number | null;
  isTrialExpired: boolean;
  isFreeUser: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            id: user.id,
            status: 'trial',
            trial_start: now.toISOString(),
            trial_end: trialEnd.toISOString(),
            cancel_at_period_end: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating subscription:', insertError);
        } else {
          setSubscription(newSub);
        }
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const hasActiveAccess = () => {
    // Always grant access - no paywall
    return true;
  };

  const isPremium = () => {
    // Always grant premium access - no paywall
    return true;
  };

  const isFreeUser = () => {
    // No free users - everyone has premium
    return false;
  };

  const getDaysLeftInTrial = () => {
    // No trial period - always null
    return null;
  };

  const isTrialExpired = () => {
    // No trial to expire
    return false;
  };

  const createCheckoutSession = async () => {
    setCheckoutLoading(true);
    try {
      console.log('Starting checkout session...');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No session found. Please log in again.');
      }

      const successUrl = `${window.location.origin}?payment=success`;
      const cancelUrl = `${window.location.origin}?payment=canceled`;

      console.log('Calling create-checkout-session edge function...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            successUrl,
            cancelUrl,
          }),
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok || data.error) {
        const errorMsg = data.error || 'Error al crear la sesión de pago';
        const errorDetails = data.details ? `\n\nDetalles técnicos: ${data.details}` : '';
        console.error('Checkout error:', { error: data.error, details: data.details });
        throw new Error(errorMsg + errorDetails);
      }

      if (!data.url) {
        throw new Error('No se recibió URL de pago del servidor');
      }

      console.log('Redirecting to Stripe checkout...');
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      if (errorMessage.includes('Stripe no está configurado')) {
        alert(`⚠️ Pagos no disponibles\n\n${errorMessage}\n\nPor favor contacta a soporte para habilitar los pagos.`);
      } else {
        alert(`❌ Error al procesar el pago\n\n${errorMessage}\n\nSi el problema persiste, contacta a soporte.`);
      }

      setCheckoutLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        checkoutLoading,
        hasActiveAccess: hasActiveAccess(),
        isPremium: isPremium(),
        daysLeftInTrial: getDaysLeftInTrial(),
        isTrialExpired: isTrialExpired(),
        isFreeUser: isFreeUser(),
        refreshSubscription: fetchSubscription,
        createCheckoutSession,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
