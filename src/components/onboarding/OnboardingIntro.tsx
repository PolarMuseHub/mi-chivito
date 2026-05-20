import React from 'react';

interface OnboardingIntroProps {
  onContinue: () => void;
}

const OnboardingIntro: React.FC<OnboardingIntroProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center border-4 border-coral-500">
            <span className="text-8xl">🐐📝</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-sage-900 mb-4 leading-tight">
          Tú guardas la lana,<br/>yo llevo las cuentas.
        </h1>

        <p className="text-base text-sage-500 mb-10 leading-relaxed">
          Olvídate de las notas en papel. Tú juntas el dinero donde quieras
          (bote, banco o colchón) y yo te ayudo a no gastártelo en tonterías.
        </p>

        <button
          onClick={onContinue}
          className="w-full bg-sage-600 text-white rounded-full px-6 py-3 font-medium hover:bg-sage-700 transition-all shadow-sm"
        >
          ¡Jalo!
        </button>
      </div>
    </div>
  );
};

export default OnboardingIntro;
