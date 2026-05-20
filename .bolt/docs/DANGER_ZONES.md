DANGER_ZONES.md — Mi Chivito
Generado por Arqueología · Abril 2026

Zonas de Alto Riesgo
🔴 CRÍTICO — No tocar sin plan de migración
src/context/FinanceContext.tsx

Es el contexto más usado de la app. Importado por App.tsx y múltiples componentes.
Almacena transacciones en localStorage. Si se migra a Supabase mal, los usuarios pierden sus datos.
Blast radius: App.tsx, BalanceDisplay, AddTransactionForm, TransactionList, AIFinanceAnalytics
Regla: Cualquier cambio requiere plan de migración de datos localStorage → Supabase primero.


supabase/migrations/

13 migraciones aplicadas en producción. Las últimas son conflictivas entre sí (agregan y eliminan los mismos índices múltiples veces).
Antes de agregar una migración nueva, revisar el estado final real de la BD en el dashboard de Supabase.
Regla: Nunca asumir el estado del schema solo por leer las migraciones. Verificar en Supabase dashboard.


src/context/SubscriptionContext.tsx

Contiene la lógica de Stripe + trial. Actualmente hasActiveAccess, isPremium, isFreeUser siempre retornan true/false hardcodeado.
Si alguien "activa el paywall" cambiando estas funciones sin configurar Stripe correctamente, nadie podrá usar la app.
Regla: Ver STRIPE_SETUP_GUIDE.md antes de tocar este archivo.


🟡 MODERADO — Requiere cuidado
src/utils/streakLogic.ts

Lógica compleja de timezone (America/Mexico_City) y cálculo de días.
Escribe en user_streaks y streak_events en Supabase.
Un bug aquí rompe el sistema de rachas para todos los usuarios.
Regla: No modificar la lógica de cálculo de días sin tests.


supabase/functions/scan-ticket/index.ts

Usa Gemini API para OCR. Las keys están en variables de entorno de Supabase Edge Functions.
Regla: La migración a GCP Document AI debe hacerse en esta función, no en el frontend.


supabase/functions/stripe-webhook/index.ts

Maneja eventos de pago. Un error aquí = suscripciones que no se actualizan.
Regla: Solo tocar con las instrucciones del STRIPE_SETUP_GUIDE.md.


🟢 BAJO — Relativamente seguro
src/components/gamification/ — Componentes de UI aislados, no afectan datos.
src/components/onboarding/ — Solo se ejecuta una vez por usuario.
src/utils/categories.ts — Datos estáticos de categorías. No toca Supabase.

Variables de Entorno Requeridas
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
En Supabase Edge Functions (configuradas en dashboard):
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GEMINI_API_KEY=

Patrones de Naming Conflictivos

Hay DOS StreakCounter en el proyecto:

src/components/StreakCounter.tsx — versión standalone, usa FinanceContext
src/components/gamification/StreakCounter.jsx — versión para GamificationBar
No confundirlos. Al migrar gamificación, consolidar en uno solo.


Hay DOS sistemas de streak:

GamificationContext.jsx — streak en localStorage (LEGACY)
streakLogic.ts + user_streaks en Supabase (CANÓNICO)
Al migrar ChivoCoins, eliminar el streak de GamificationContext y usar el canónico.