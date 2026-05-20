import React, { useState } from 'react';
import { completeOnboarding } from '../../utils/onboarding';

interface CommitmentProps {
  onComplete: () => void;
}

const Commitment: React.FC<CommitmentProps> = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommit = async () => {
    setIsSubmitting(true);
    const success = await completeOnboarding();
    setIsSubmitting(false);

    if (success) {
      onComplete();
    } else {
      alert('Error al completar. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-56 h-56 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center border border-cream-200 animate-pulse">
            <span className="text-9xl">🐐🤝</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-sage-900 mb-8">
          ¡Trato hecho!
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8 text-left border border-cream-200">
          <p className="text-base text-sage-500 leading-relaxed mb-6">
            Tú eres el dueño del dinero. Mi única chamba es recordarte registrar
            cada peso que ahorres y cada peso que gastes, para que las cuentas salgan claras.
          </p>
          <p className="text-base text-sage-900 leading-relaxed font-bold bg-cream-100 p-4 rounded-2xl border-l-4 border-sage-600">
            Si tú no haces trampa, yo te llevo a la meta. ¿Le entras?
          </p>
        </div>

        <button
          onClick={handleCommit}
          disabled={isSubmitting}
          className="w-full bg-sage-600 text-white rounded-full px-6 py-3 font-medium hover:bg-sage-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Finalizando...
            </span>
          ) : (
            '¡A darle!'
          )}
        </button>
      </div>
    </div>
  );
};

export default Commitment;
