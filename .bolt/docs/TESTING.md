Estado Actual
Tests existentes: 0 (ninguno).  
El proyecto tiene `App.test.tsx` del template inicial pero está vacío.  
No hay framework de testing configurado activamente.
Definition of Done para toda feature nueva:  
Una feature no está terminada hasta que tenga al menos los unit tests marcados como requeridos abajo.
---
Stack de Testing Recomendado
Herramienta	Propósito
Vitest	Unit tests (reemplaza Jest, compatible con Vite)
@testing-library/react	Tests de componentes React
@supabase/supabase-js mock	Mock del cliente Supabase en tests
Instalación:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```
Agregar a `vite.config.ts`:
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts'
}
```
---
Tests Requeridos por Área
🔴 CRÍTICO — Construir ANTES de la migración de ChivoCoins
`utils/streakLogic` — Lógica de rachas
```typescript
// streakLogic.test.ts
describe('getDaysDifference', () => {
  it('mismo día → 0', ...)
  it('día anterior → 1', ...)
  it('hace 2 días → 2', ...)
})

describe('calculateAndUpdateStreak', () => {
  it('primera vez → streak = 1', ...)
  it('día consecutivo → streak + 1', ...)
  it('día saltado → streak = 1 (roto)', ...)
  it('mismo día dos veces → streak no cambia', ...)
})
```
`utils/goals` — Lógica de metas financieras
```typescript
describe('calcularProgresoMeta', () => {
  it('sin ahorro → 0%', ...)
  it('ahorro = target → 100%', ...)
  it('ahorro > target → no supera 100%', ...)
})
```
---
🟡 IMPORTANTE — Construir al migrar ChivoCoins a Supabase
`context/GamificationContext` — Reglas de negocio de coins
```typescript
describe('registerTransaction — coins base', () => {
  it('registrar transacción suma 10 coins', ...)
  it('bonus aleatorio suma 20 coins (no 10)', ...)
})

describe('streak bonuses', () => {
  it('racha de 3 días otorga +25 coins', ...)
  it('racha de 7 días otorga +75 coins', ...)
  it('racha de 14 días otorga +75 coins', ...)
  it('racha de 4 días NO otorga bonus', ...)
})
```
---
🟢 RECOMENDADO — Construir cuando haya tiempo
`context/FinanceContext` — Cálculos de balance
```typescript
describe('getBalance', () => {
  it('sin transacciones → todo en 0', ...)
  it('ingreso 1000, gasto 400 → total 600', ...)
  it('filtro por fecha funciona correctamente', ...)
  it('deudas y ahorros no afectan el total', ...)
})
```
`utils/recurringTransactions` — Transacciones recurrentes
```typescript
describe('calculateNextOccurrence', () => {
  it('semanal → 7 días después', ...)
  it('mensual → mismo día mes siguiente', ...)
  it('quincenal → 15 días después', ...)
})

describe('processRecurringTransactions', () => {
  it('no genera duplicado si next_occurrence es hoy y ya se procesó', ...)
  it('genera nueva transacción cuando llega la fecha', ...)
})
```
---
Convención de Archivos de Test
```
src/
  utils/
    streakLogic.ts
    streakLogic.test.ts     ← test junto al archivo que prueba
  context/
    GamificationContext.tsx
    GamificationContext.test.tsx
  test/
    setup.ts                ← configuración global de testing
    mocks/
      supabase.ts           ← mock del cliente Supabase
```
---
Mock de Supabase para Tests
```typescript
// src/test/mocks/supabase.ts
vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } } 
      })
    }
  }
}));
```