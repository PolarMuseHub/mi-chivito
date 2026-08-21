import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OnboardingIntroProps {
  onContinue: () => void;
}

const OnboardingIntro: React.FC<OnboardingIntroProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-sm w-full bg-white rounded-[28px] border border-[#F1E4D7] p-8 sm:p-9 shadow-sm flex flex-col items-center text-center">
        {/* Icon Ring with Badge */}
        <div className="relative w-[110px] h-[110px] rounded-full border-2 border-orange-light bg-white flex items-center justify-center mb-6">
          <span className="text-[46px] select-none leading-none">🐐</span>
          <div className="absolute bottom-[2px] right-[2px] w-[34px] h-[34px] rounded-[10px] bg-white shadow-[0_6px_14px_-4px_rgba(48,28,10,0.25)] border border-[#F1E4D7] flex items-center justify-center text-[16px] select-none">
            📝
          </div>
        </div>

        {/* Title */}
        <h1 className="font-['Fraunces',serif] font-bold text-[25px] text-[#241B14] leading-[1.25] mb-3">
          Tú guardas la lana,<br />yo llevo las cuentas.
        </h1>

        {/* Subtitle */}
        <p className="text-[13.5px] text-[#8A7F72] font-medium leading-[1.6] max-w-[280px] mx-auto mb-7">
          Olvídate de las notas en papel. Tú juntas el dinero donde quieras
          (bote, banco o colchón) y yo te ayudo a no gastártelo en tonterías.
        </p>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full border-none rounded-[14px] py-4 px-6 bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_14px_24px_-10px_rgba(226,97,15,0.65)] hover:opacity-95 transform hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>¡Jalo!</span>
          <ArrowRight className="w-[18px] h-[18px] stroke-[2.4]" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingIntro;
