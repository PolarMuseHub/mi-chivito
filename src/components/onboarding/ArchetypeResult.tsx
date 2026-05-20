import React from 'react';
import type { Archetype } from '../../utils/archetypeEngine';

interface ArchetypeResultProps {
  archetype: Archetype;
  onContinue: () => void;
}

const ArchetypeResult: React.FC<ArchetypeResultProps> = ({ archetype, onContinue }) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-6 animate-fade-in"
      style={{ backgroundColor: `${archetype.color}0D` }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <div
          data-key={archetype.imageKey}
          className="w-56 h-56 rounded-3xl flex items-center justify-center mb-8"
          style={{ backgroundColor: `${archetype.color}33` }}
        >
          <span className="text-[64px] leading-none">🐐</span>
        </div>

        <h1 className="text-2xl font-bold text-sage-900 text-center">
          {archetype.name}
        </h1>

        <p className="text-base text-gray-600 text-center italic mt-2">
          {archetype.headline}
        </p>

        <p className="text-sm text-gray-700 text-center max-w-xs mx-auto mt-4 leading-relaxed">
          {archetype.message}
        </p>
      </div>

      <div className="w-full max-w-sm pb-4 pt-8">
        <button
          onClick={onContinue}
          className="w-full bg-[#718c69] text-white rounded-full py-3 font-medium text-base transition-all hover:brightness-110 active:scale-[0.98]"
        >
          ¡Ese soy yo! Seguir →
        </button>
      </div>
    </div>
  );
};

export default ArchetypeResult;
