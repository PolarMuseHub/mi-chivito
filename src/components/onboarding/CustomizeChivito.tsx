import React, { useState } from 'react';
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
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full bg-[#718c69]/10 flex items-center justify-center mb-4">
            <span className="text-[48px] leading-none">🐐</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-sage-900">
            Ponle nombre a tu Chivito
          </h2>
          <p className="text-gray-500 text-sm text-center mt-2 max-w-xs">
            Tu Chivito te va a acompañar en este camino financiero. Dale un nombre que te guste.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={chivitoName}
            onChange={(e) => {
              setChivitoName(e.target.value);
              setError('');
            }}
            placeholder="Escribe el nombre aqui..."
            className="w-full text-center text-2xl font-bold py-4 px-6 bg-white border border-cream-200 rounded-2xl focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 transition-all placeholder:text-sage-400 shadow-sm"
            maxLength={20}
          />
          {error && <p className="text-coral-500 text-center mt-2 font-medium">{error}</p>}
          <p className="text-sage-400 text-sm text-center mt-2">
            Ej: "El Billetes", "Pancho", "Chivito"
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!chivitoName.trim() || isSubmitting}
          className="w-full bg-[#718c69] text-white rounded-full px-6 py-3 font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          ) : (
            '¡A darle!'
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomizeChivito;
