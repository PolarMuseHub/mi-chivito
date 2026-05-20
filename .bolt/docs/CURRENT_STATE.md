CURRENT_STATE.md — Mi Chivito
Última actualización: Abril 10, 2026 · Post-Arqueología

PROJECT_MODE: PLASTIC
(Pre-producción: moverse rápido, sin migraciones de datos en vivo)

Estado General
La app está funcionalmente completa en casi todas sus features. El único item pendiente confirmado es la migración de ChivoCoins de localStorage a Supabase y su integración en el flujo principal.

✅ Qué Funciona

Auth completo (login, registro, reset de contraseña, eliminar cuenta)
Onboarding con personalización del Chivito
Agregar y visualizar transacciones (localStorage)
Categorías y subcategorías completas (91 subcategorías)
Transacciones recurrentes
Metas financieras (CRUD completo, sincronizado con Supabase)
Streak tracking (Supabase: user_streaks, streak_events)
AI Finance Analytics (Edge Function activa)
Ticket Scanner OCR (Edge Function con Gemini)
Infraestructura Stripe lista (paywall deshabilitado intencionalmente)
PWA con manifest e íconos
Privacy Policy y Términos


⚠️ Deuda Técnica Documentada
ItemImpactoPrioridadTransacciones en localStorage — La tabla transactions en Supabase existe pero FinanceContext no la usaAlto: datos atrapados por dispositivo, se pierden al limpiar cachéMedia (no bloquea ChivoCoins)GamificationContext en .jsx — Deuda de tipadoBajo: funciona pero no tiene type safetyBajaDuplicación de Streak logic — GamificationContext tiene su propio streak en localStorage, separado del streak de Supabase en streakLogic.tsMedio: dos fuentes de verdad para el mismo datoResolver al migrar ChivoCoins

🎯 Próxima Tarea: ChivoCoins a Supabase
Lo que ya existe (no re-crear):

GamificationContext.jsx — lógica completa de coins, streak bonuses, rewardModal
CoinDisplay.jsx — UI del contador de coins
RewardModal.jsx — modal de celebración
GamificationBar.jsx — barra con Chivito + coins + streak
StreakCounter.jsx (gamification/) — versión del contador de racha para la barra

Lo que falta (3 pasos):

Migración SQL: Crear tabla user_coins en Supabase
Contexto: Migrar GamificationContext.jsx de localStorage → Supabase. Eliminar el streak duplicado (usar el de streakLogic.ts). Migrar a TypeScript.
Integración:

Envolver App con GamificationProvider en main.tsx o App.tsx
Llamar registerTransaction() desde addTransaction() en FinanceContext.tsx



Reglas de negocio de ChivoCoins (de GamificationContext.jsx):

Registrar transacción = +10 ChivoCoins
20% de probabilidad de bonus x2 = +20 ChivoCoins (en lugar de 10)
Racha de 3 días = +25 ChivoCoins bonus
Racha de 7 días (y múltiplos de 7) = +75 ChivoCoins bonus


📋 Checklist Sesión Actual

 Arqueología completa
 7 documentos base generados
 Crear migración SQL para user_coins
 Migrar GamificationContext a Supabase + TypeScript
 Conectar GamificationProvider al árbol de la app
 Conectar registerTransaction() → addTransaction()
 Probar flujo completo de coins


Archivos .md de Contexto en el Proyecto
El proyecto ya tiene documentación parcial generada por bolt.new en sesiones anteriores. Estos archivos son útiles como referencia pero este /docs folder es la fuente de verdad:

AI_ANALYTICS_SETUP.md — Setup de la Edge Function de analytics
CHART_IMPROVEMENTS.md — Mejoras planeadas para charts
FINANCIAL_GOALS_FEATURE.md — Documentación de la feature de metas
STREAK_TRACKING_FEATURE.md — Documentación del sistema de rachas
STRIPE_SETUP_GUIDE.md — Instrucciones para activar Stripe
GCP_DOCUMENT_AI_SETUP.md — Migración de OCR a GCP Document AI
SECURITY_AUDIT_FIXES.md — Fixes de seguridad aplicados