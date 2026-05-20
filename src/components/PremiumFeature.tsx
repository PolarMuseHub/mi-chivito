import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Lock, Sparkles, CreditCard, Check, Loader2, ArrowLeft } from 'lucide-react';

interface PremiumFeatureProps {
  children: React.ReactNode;
  featureName: string;
  featureDescription: string;
  showPreview?: boolean;
  previewContent?: React.ReactNode;
  onDismiss?: () => void;
}

export function PremiumFeature({
  children,
  featureName,
  featureDescription,
  showPreview = false,
  previewContent,
  onDismiss
}: PremiumFeatureProps) {
  const { isPremium, checkoutLoading, createCheckoutSession, daysLeftInTrial } = useSubscription();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {showPreview && previewContent && (
        <div className="opacity-40 pointer-events-none blur-sm">
          {previewContent}
        </div>
      )}

      <div className={`${showPreview ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border-2 border-sage-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-100 to-sage-200 rounded-full mb-4">
              <Lock className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              {featureName}
              <Sparkles className="w-5 h-5 text-sage-600" />
            </h3>
            <p className="text-gray-600">
              {featureDescription}
            </p>
            {daysLeftInTrial !== null && daysLeftInTrial > 0 && (
              <div className="mt-3 inline-block bg-sage-100 text-sage-800 px-3 py-1 rounded-full text-sm font-medium">
                {daysLeftInTrial} {daysLeftInTrial === 1 ? 'día' : 'días'} restantes en tu prueba
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Análisis financiero con IA personalizado</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Exportación de datos en CSV</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Sugerencias de ahorro inteligentes</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Soporte prioritario</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={createCheckoutSession}
              disabled={checkoutLoading}
              className="w-full bg-gradient-to-r from-sage-500 to-sage-600 text-white py-4 rounded-lg font-semibold hover:from-sage-600 hover:to-sage-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Desbloquear Premium
                </>
              )}
            </button>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Continuar con versión gratuita
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            Cancela en cualquier momento. Pago seguro con Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
