import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-5 sm:p-6 animate-fade-in">
      <div className="max-w-[520px] w-full flex flex-col items-center text-center">
        <div className="w-[130px] h-[130px] rounded-[28px] bg-white border border-[#F1E4D7] flex items-center justify-center mb-6 shadow-[0_20px_40px_-20px_rgba(48,28,10,.25)]">
          <span className="text-[52px] leading-none select-none">🐐🤝</span>
        </div>

        <h1 className="font-['Fraunces',serif] font-bold text-[25px] text-[#241B14] leading-[1.25] mb-5">
          ¡Trato hecho!
        </h1>

        <div className="w-full bg-white border border-[#F1E4D7] rounded-[18px] p-5 text-left mb-5">
          <p className="text-[13px] text-[#8A7F72] font-medium leading-[1.6]">
            Tú eres el dueño del dinero. Mi única chamba es recordarte registrar
            cada peso que ahorres y cada peso que gastes, para que las cuentas salgan claras.
          </p>
        </div>

        <div className="w-full bg-white border border-[#F1E4D7] border-l-4 border-l-orange rounded-[14px] p-4 px-[18px] text-left mb-6">
          <p className="text-[13.5px] text-[#241B14] font-bold leading-[1.5]">
            Si tú no haces trampa, yo te llevo a la meta. ¿Le entras?
          </p>
        </div>

        <button
          onClick={handleCommit}
          disabled={isSubmitting}
          className="w-full border-none rounded-[14px] py-[15px] px-6 bg-gradient-to-b from-[#6E8C71] to-[#557358] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_14px_24px_-10px_rgba(85,115,88,.5)] hover:opacity-95 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finalizando...
            </span>
          ) : (
            <>¡A darle! <ArrowRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Commitment;
