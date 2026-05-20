CONVENTIONS.md — Mi Chivito
Generado por Arqueología · Abril 2026

CRÍTICO: Reglas de Patrón
Este codebase tiene patrones CANÓNICOS y patrones LEGACY (deuda técnica).
Siempre seguir el patrón CANÓNICO. Nunca copiar el LEGACY.

1. Lenguaje
CANÓNICO: TypeScript (.tsx / .ts) para todo archivo nuevo.
LEGACY (no copiar): GamificationContext.jsx — archivo JavaScript puro sin tipos. Al modificarlo, migrarlo a .tsx.

2. Persistencia de Datos
CANÓNICO: Supabase Postgres para todos los datos de usuario.
typescriptconst { data, error } = await supabase
  .from('nombre_tabla')
  .select('*')
  .eq('user_id', user.id);
LEGACY (no copiar): localStorage para transacciones y gamificación.
typescript// ❌ NO hacer esto en código nuevo
localStorage.setItem('miChivitoTransactions', JSON.stringify(data));

3. Componentes
CANÓNICO: Functional components con TypeScript interface para props.
typescriptinterface Props {
  value: number;
  onAction: () => void;
}

const MiComponente: React.FC<Props> = ({ value, onAction }) => {
  return <div className="...">{value}</div>;
};

export default MiComponente;

4. Estilos
CANÓNICO: Solo clases Tailwind CSS.
typescript<div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
NUNCA: CSS inline para layout, ni archivos .css separados (excepto index.css que ya existe).

5. Contexto / Estado Global
CANÓNICO: React Context para estado compartido.

Crear un archivo en src/context/NombreContext.tsx
Exportar: el Provider, el hook useNombre()
El hook debe lanzar error si se usa fuera del Provider

typescriptexport function useNombre(): NombreContextType {
  const context = useContext(NombreContext);
  if (!context) throw new Error('useNombre debe usarse dentro de NombreProvider');
  return context;
}

6. Llamadas a Supabase
CANÓNICO: Siempre manejar el error explícitamente.
typescriptconst { data, error } = await supabase.from('tabla').select('*');
if (error) {
  console.error('Error:', error);
  return null;
}
return data;
NUNCA: Asumir que data existe sin verificar error.

7. Auth — Obtener usuario actual
CANÓNICO:
typescriptconst { data: { user } } = await supabase.auth.getUser();
if (!user) return; // siempre guard

8. Naming Conventions
ElementoConvenciónEjemploComponentesPascalCaseBalanceDisplay.tsxHooks/utilscamelCaseuseFinance, streakLogic.tsContextosPascalCase + ContextFinanceContext.tsxTablas Supabasesnake_caseuser_profiles, financial_goalsVariables/funcionescamelCaseaddTransaction, currentStreakTipos TypeScriptPascalCaseTransaction, FinancialGoalConstantesUPPER_SNAKE_CASEEVENTS.TRANSACTION_ADDED

9. Texto / Idioma
CANÓNICO: Español para todo texto visible al usuario (UI, mensajes, labels).
Inglés solo para: nombres de variables, funciones, comentarios de código, nombres de archivos.