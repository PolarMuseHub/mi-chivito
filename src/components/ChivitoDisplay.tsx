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
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-cream-200">
      <div className="flex items-center gap-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: archetypeColor ? `${archetypeColor}33` : '#f5f0eb' }}
        >
          <span className="text-5xl">🐐</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-sage-900">{chivitoName}</h2>
          <p className="text-base text-sage-600 mt-1">Tu coach financiero personal</p>
        </div>
      </div>
    </div>
  );
};
