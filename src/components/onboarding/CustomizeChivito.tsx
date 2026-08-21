import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { updateChivitoCustomization } from '../../utils/onboarding';

interface CustomizeChivitoProps {
  onContinue: (chivitoName: string) => void;
}

const CustomizeChivito: React.FC<CustomizeChivitoProps> = ({ onContinue }) => {
  const [chivitoName, setChivitoName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!chivitoName.trim()) {
      setError('Dale un nombre a tu Chivito');
      return;
    }

    setIsSubmitting(true);
    await updateChivitoCustomization(chivitoName, []);
    setIsSubmitting(false);
    onContinue(chivitoName);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-sm w-full bg-white rounded-[28px] border border-[#F1E4D7] p-8 sm:p-9 shadow-sm flex flex-col items-center text-center">
        {/* Icon Ring */}
        <div className="w-[96px] h-[96px] rounded-full border-2 border-orange-light bg-white flex items-center justify-center mb-6">
          <span className="text-[40px] select-none leading-none">🐐</span>
        </div>

        {/* Title */}
        <h1 className="font-['Fraunces',serif] font-bold text-[25px] text-[#241B14] leading-[1.25] mb-2">
          Ponle nombre a tu Chivito
        </h1>

        {/* Subtitle */}
        <p className="text-[13.5px] text-[#8A7F72] font-medium leading-[1.6] max-w-[280px] mx-auto mb-6">
          Tu Chivito te va a acompañar en este camino financiero. Dale un nombre que te guste.
        </p>

        {/* Name Input */}
        <div className="w-full mb-6 text-center">
          <input
            type="text"
            value={chivitoName}
            onChange={(e) => {
              setChivitoName(e.target.value);
              setError('');
            }}
            placeholder="Ej. El Billetes, Pancho, Chivito"
            className="w-full text-center font-['Fraunces',serif] font-bold text-[19px] text-[#241B14] bg-white border-2 border-[#F1E4D7] rounded-[16px] py-4 px-4 outline-none uppercase tracking-[0.01em] focus:border-orange focus:ring-4 focus:ring-orange-light placeholder:normal-case placeholder:font-sans placeholder:font-semibold placeholder:text-[14px] placeholder:text-[#C4B9AA] transition-all"
            maxLength={20}
          />
          {error && <p className="text-[#E2523D] text-xs font-semibold mt-2">{error}</p>}
          <p className="text-[11.5px] text-[#B7AB9C] font-semibold mt-2">
            Ej: "El Billetes", "Pancho", "Chivito"
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          disabled={!chivitoName.trim() || isSubmitting}
          className="w-full border-none rounded-[14px] py-4 px-6 bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_14px_24px_-10px_rgba(226,97,15,0.65)] hover:opacity-95 transform hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando...</span>
            </span>
          ) : (
            <>
              <span>¡A darle!</span>
              <ArrowRight className="w-[18px] h-[18px] stroke-[2.4]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomizeChivito;
