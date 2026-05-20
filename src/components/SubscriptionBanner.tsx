import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { AlertCircle, CreditCard, Clock } from 'lucide-react';

export function SubscriptionBanner() {
  const {
    subscription,
    hasActiveAccess,
    daysLeftInTrial,
    isTrialExpired,
    createCheckoutSession,
    loading,
  } = useSubscription();

  if (loading || !subscription) {
    return null;
  }

  if (subscription.status === 'active') {
    return null;
  }

  if (isTrialExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Your free trial has ended</p>
              <p className="text-sm opacity-90">
                Subscribe now to continue using all features
              </p>
            </div>
          </div>
          <button
            onClick={createCheckoutSession}
            className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  if (subscription.status === 'trial' && daysLeftInTrial !== null) {
    const isLastWeek = daysLeftInTrial <= 7;

    return (
      <div
        className={`${
          isLastWeek ? 'bg-orange-600' : 'bg-sage-600'
        } text-white px-4 py-3 shadow-lg`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                {daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} left in your free
                trial
              </p>
              <p className="text-sm opacity-90">
                Subscribe anytime to continue after your trial ends
              </p>
            </div>
          </div>
          <button
            onClick={createCheckoutSession}
            className="bg-white text-sage-600 px-6 py-2 rounded-lg font-semibold hover:bg-sage-50 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  if (subscription.status === 'past_due') {
    return (
      <div className="bg-yellow-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Payment failed</p>
              <p className="text-sm opacity-90">
                Please update your payment method to continue service
              </p>
            </div>
          </div>
          <button
            onClick={createCheckoutSession}
            className="bg-white text-yellow-600 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Update Payment
          </button>
        </div>
      </div>
    );
  }

  return null;
}
