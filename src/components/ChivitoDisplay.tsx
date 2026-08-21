import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../utils/onboarding';
import { ARCHETYPES } from '../utils/archetypeEngine';
import type { ArchetypeId } from '../utils/archetypeEngine';

export const ChivitoDisplay: React.FC = () => {
  const [chivitoName, setChivitoName] = useState<string | null>(null);
  const [archetypeColor, setArchetypeColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChivitoData();
  }, []);

  const fetchChivitoData = async () => {
    const profile = await getUserProfile();
    if (profile) {
      setChivitoName(profile.chivito_name);
      const archId = (profile as Record<string, unknown>).chivito_archetype_id as string | null;
      if (archId && archId in ARCHETYPES) {
        setArchetypeColor(ARCHETYPES[archId as ArchetypeId].color);
      }
    }
    setLoading(false);
  };

  if (loading || !chivitoName) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-orange-dark/20">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ backgroundColor: archetypeColor ? `${archetypeColor}33` : '#f5f0eb' }}
        >
          <span className="text-4xl">🐐</span>
        </div>
        <div>
          <h2 className="text-xl font-bold font-['Fraunces'] text-ink">{chivitoName}</h2>
          <p className="text-sm text-body font-semibold mt-0.5">Tu coach financiero personal</p>
        </div>
      </div>
    </div>
  );
};
