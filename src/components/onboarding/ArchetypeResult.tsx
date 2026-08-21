import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Archetype } from '../../utils/archetypeEngine';

interface ArchetypeResultProps {
  archetype: Archetype;
  onContinue: () => void;
}

const ArchetypeResult: React.FC<ArchetypeResultProps> = ({ archetype, onContinue }) => {
  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-sm w-full bg-white rounded-[28px] border border-[#F1E4D7] p-8 sm:p-9 shadow-sm flex flex-col items-center text-center">
        {/* Archetype Icon */}
        <div
          data-key={archetype.imageKey}
          className="w-[150px] h-[150px] rounded-[28px] bg-white border border-[#F1E4D7] flex items-center justify-center mb-6 shadow-[0_20px_40px_-20px_rgba(48,28,10,0.25)]"
        >
          <span className="text-[64px] select-none leading-none">🐐</span>
        </div>

        {/* Title */}
        <h1 className="font-['Fraunces',serif] font-bold text-[25px] text-[#241B14] leading-[1.25] mb-2">
          {archetype.name}
        </h1>

        {/* Kicker */}
        <div className="text-[13px] font-bold text-orange-dark italic mb-3.5">
          {archetype.headline}
        </div>

        {/* Description */}
        <p className="text-[13.5px] text-[#8A7F72] font-medium leading-[1.6] max-w-[280px] mx-auto mb-7">
          {archetype.message}
        </p>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full border-none rounded-[14px] py-4 px-6 bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_14px_24px_-10px_rgba(226,97,15,0.65)] hover:opacity-95 transform hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>¡Ese soy yo! Seguir</span>
          <ArrowRight className="w-[18px] h-[18px] stroke-[2.4]" />
        </button>
      </div>
    </div>
  );
};

export default ArchetypeResult;
