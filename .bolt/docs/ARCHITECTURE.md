ARCHITECTURE.md — Mi Chivito
Generado por Arqueología · Abril 2026

Stack Tecnológico
CapaTecnologíaVersiónNotasFramework UIReact18.3BundlerVite5.4LenguajeTypeScript5.5⚠️ GamificationContext.jsx está en JS puroEstilosTailwind CSS3.4RoutingReact Router DOM7.11Backend / DBSupabase2.39Auth + Postgres + Edge FunctionsPagosStripevía Edge FunctionInfraestructura lista, actualmente deshabilitadaChartsChart.js + react-chartjs-24.4IconosLucide React0.344PWAvite-plugin-pwa0.19Manifest + Service Worker configurados

Arquitectura General
React App (SPA + PWA)
│
├── AuthWrapper — Supabase Auth (email/password + magic link)
│   └── FinanceProvider (Context)
│       └── AppContent
│           ├── Header + SectionNavigation
│           ├── ChivitoDisplay (mascota animada)
│           ├── StreakCounter (datos de Supabase)
│           ├── GoalDisplay (datos de Supabase)
│           └── Secciones: balance | nuevo | metas | analytics | info
│
├── SubscriptionProvider (Context) — Stripe/Supabase
└── GamificationProvider (Context) ← ⚠️ NO ESTÁ EN EL ÁRBOL DE App.tsx

Reglas No Negociables

Auth: Solo Supabase Auth. Nunca implementar auth custom.
DB: Solo Supabase Postgres con RLS habilitado en todas las tablas.
Estilos: Solo Tailwind CSS. No CSS modules, no styled-components.
Edge Functions: Para operaciones con secretos (Stripe, AI, OCR). Nunca exponer keys en el frontend.
TypeScript: Todo archivo nuevo debe ser .tsx/.ts. El .jsx existente es deuda técnica.


Patrones de Datos
ÁreaPatrón ActualEstadoAuthSupabase Auth✅ CanónicoTransaccioneslocalStorage (FinanceContext)⚠️ DEUDA TÉCNICA — tabla en Supabase existe pero no se usaStreaksSupabase (user_streaks, streak_events)✅ CanónicoMetas financierasSupabase (financial_goals)✅ CanónicoPerfil de usuarioSupabase (user_profiles)✅ CanónicoChivoCoins / GamificaciónlocalStorage (GamificationContext)❌ PENDIENTE MIGRAR a SupabaseSuscripciónSupabase (subscriptions) + Stripe⚠️ Infraestructura lista, paywall deshabilitado

Edge Functions (Supabase)
FunciónPropósitoEstadoai-finance-analyticsAnálisis IA del gasto✅ Activascan-ticketOCR de tickets (Gemini)✅ Activa · Migración planeada a GCP Document AIprocess-receiptProcesamiento de recibos✅ Activacreate-checkout-sessionStripe checkout✅ Lista · Paywall deshabilitado en appstripe-webhookManejo de eventos Stripe✅ Listadelete-user-accountBorrado de cuenta✅ Activa

Dependencias Externas

Supabase: Base de datos, Auth, Storage, Edge Functions
Stripe: Pagos (configurado pero no activo en producción)
Gemini API: OCR de tickets (via Edge Function scan-ticket)
GCP Document AI: Planeado como reemplazo de Gemini OCR