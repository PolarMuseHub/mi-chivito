import React from 'react';

type Section = 'balance' | 'nuevo' | 'nueva' | 'metas' | 'analisis' | 'analytics' | 'info' | 'transacciones' | string;

interface SectionNavigationProps {
  activeSection: Section;
  onSectionChange: (section: any) => void;
  className?: string;
  isFixed?: boolean;
}

export default function SectionNavigation({
  activeSection,
  onSectionChange,
  className = '',
  isFixed = false,
}: SectionNavigationProps) {
  const isTabActive = (itemKey: string) => {
    if (itemKey === 'balance') return activeSection === 'balance';
    if (itemKey === 'nuevo') return activeSection === 'nuevo' || activeSection === 'nueva';
    if (itemKey === 'metas') return activeSection === 'metas';
    if (itemKey === 'analisis') return activeSection === 'analisis' || activeSection === 'analytics';
    if (itemKey === 'info') return activeSection === 'info' || activeSection === 'transacciones';
    return activeSection === itemKey;
  };

  return (
    <nav
      className={`bg-white border-t border-[#F1E4D7] flex items-end justify-around px-2 pt-2 pb-4 z-30 transition-all select-none ${
        isFixed ? 'fixed bottom-0 left-0 right-0 shadow-lg' : 'rounded-2xl border shadow-sm my-4'
      } ${className}`}
    >
      {/* 1. Balance */}
      <button
        type="button"
        onClick={() => onSectionChange('balance')}
        className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('balance') ? 'text-orange-dark font-bold' : 'text-[#8A7F72] hover:text-[#241B14] font-semibold'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="7" width="18" height="13" rx="2.5" />
          <path d="M3 10h18" />
        </svg>
        <span className="text-[10px] leading-tight">Balance</span>
      </button>

      {/* 2. Nuevo (FAB) */}
      <button
        type="button"
        onClick={() => onSectionChange(activeSection === 'nueva' ? 'nueva' : 'nuevo')}
        className={`relative -top-4 flex flex-col items-center gap-1 flex-1 transition-transform active:scale-95 cursor-pointer ${
          isTabActive('nuevo') ? 'text-orange-dark font-bold' : 'text-orange-dark font-semibold'
        }`}
      >
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9552] to-[#E2610F] flex items-center justify-center shadow-lg shadow-orange/40">
          {/* Pulso exterior decorativo */}
          <span className="absolute inset-[-4px] rounded-full border border-orange/40 animate-ping opacity-25 pointer-events-none" />
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="text-[10px] leading-tight mt-0.5">Nuevo</span>
      </button>

      {/* 3. Mis Metas */}
      <button
        type="button"
        onClick={() => onSectionChange('metas')}
        className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('metas') ? 'text-orange-dark font-bold' : 'text-[#8A7F72] hover:text-[#241B14] font-semibold'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" />
        </svg>
        <span className="text-[10px] leading-tight">Mis</span>
      </button>

      {/* 4. Análisis */}
      <button
        type="button"
        onClick={() => onSectionChange(activeSection === 'analisis' ? 'analisis' : 'analytics')}
        className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('analisis') ? 'text-orange-dark font-bold' : 'text-[#8A7F72] hover:text-[#241B14] font-semibold'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19V9M11 19V4M18 19v-7" />
        </svg>
        <span className="text-[10px] leading-tight">Análisis</span>
      </button>

      {/* 5. Mi Información */}
      <button
        type="button"
        onClick={() => onSectionChange(activeSection === 'transacciones' ? 'transacciones' : 'info')}
        className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          isTabActive('info') ? 'text-orange-dark font-bold' : 'text-[#8A7F72] hover:text-[#241B14] font-semibold'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
        <span className="text-[10px] leading-tight">Mi</span>
      </button>
    </nav>
  );
}

export type { Section };
