import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Lock, CreditCard, Check, Loader2 } from 'lucide-react';

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { hasActiveAccess, loading, checkoutLoading, createCheckoutSession, subscription } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-sage-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {subscription?.status === 'trial' ? 'Trial Ended' : 'Subscription Required'}
            </h1>
            <p className="text-gray-600">
              {subscription?.status === 'trial'
                ? 'Your free trial has ended. Subscribe to continue using all features.'
                : 'Subscribe to access all features and continue managing your finances.'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Track unlimited transactions</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">AI-powered financial analytics</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Custom categories and budgets</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Export reports and insights</p>
            </div>
          </div>

          <button
            onClick={createCheckoutSession}
            disabled={checkoutLoading}
            className="w-full bg-sage-600 text-white py-4 rounded-lg font-semibold hover:bg-sage-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Subscribe Now
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
