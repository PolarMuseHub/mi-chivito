import React from 'react';
import { Wallet, PlusCircle, TrendingUp, List } from 'lucide-react';

type Section = 'balance' | 'nueva' | 'analisis' | 'transacciones';

interface SectionNavigationProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export default function SectionNavigation({ activeSection, onSectionChange }: SectionNavigationProps) {
  const sections = [
    { id: 'balance' as Section, label: 'Balance Actual', icon: Wallet },
    { id: 'nueva' as Section, label: 'Nuevo Registro', icon: PlusCircle },
    { id: 'analisis' as Section, label: 'Análisis Financiero', icon: TrendingUp },
    { id: 'transacciones' as Section, label: 'Mi Información', icon: List },
  ];

  return (
    <nav className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`flex flex-col items-center justify-center p-4 transition-all ${
                isActive
                  ? 'bg-[#728c6a] text-white'
                  : 'bg-white text-[#728c6a] hover:bg-[#fcf3e5]'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center">{section.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { Section };
