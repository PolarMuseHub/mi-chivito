PRODUCT.md — Mi Chivito
Abril 2026
---
Qué es
Mi Chivito es una aplicación PWA de finanzas personales para usuarios de habla hispana (México-first) que quieren registrar y entender sus gastos sin la complejidad de apps bancarias tradicionales. El diferenciador es una mascota (el Chivito) y un sistema de gamificación que convierte el hábito financiero en algo motivador.
---
Usuario Objetivo
Persona de 22–38 años, México, que:
Siente que "el dinero se le va sin saber en qué"
Ha intentado apps de finanzas pero las abandona por aburrimiento
Usa su celular para todo
No es usuario de Excel ni de apps complejas
---
Problema que Resuelve
Registrar gastos es tedioso → la gente lo abandona → no tiene visibilidad de su dinero.  
Mi Chivito lo hace simple, visual y con recompensas para mantener el hábito.
---
Propuesta de Valor
> "Registra tus gastos en segundos, entiende tu dinero, y gana ChivoCoins por cada día que lo haces."
---
Versiones
v1 — MVP Completo (estado actual + ChivoCoins migrados)
Objetivo: App funcional lista para primeros usuarios reales.
Feature	Estado
Auth (login/registro/reset)	✅
Onboarding con personalización del Chivito	✅
Registrar transacciones (ingreso/gasto/deuda/ahorro)	✅
7 categorías + 91 subcategorías	✅
Transacciones recurrentes	✅
Balance y resumen visual	✅
Metas financieras	✅
Streak de días consecutivos	✅
ChivoCoins gamificación → migrar a Supabase	⚠️ Pendiente
Scanner de tickets (OCR)	✅
AI Finance Analytics	✅
PWA instalable	✅
Eliminar cuenta	✅
Criterio de salida de v1: ChivoCoins persistidos en Supabase y conectados al flujo de agregar transacciones.
---
v2 — Monetización + Beneficios Reales
Objetivo: Activar el paywall y dar valor tangible a los ChivoCoins.
Feature	Descripción
Stripe activo	Activar paywall (infraestructura ya lista)
ChivoCoins → descuentos	Canjear coins por % de descuento en suscripción mensual
OCR mejorado	Migrar scan-ticket de Gemini a GCP Document AI
Transacciones sincronizadas	Migrar FinanceContext de localStorage a Supabase
---
v3 — Inteligencia y Retención
Objetivo: Análisis predictivo y features de retención avanzada.
Feature	Descripción
Presupuestos por categoría	Alertas cuando se acerca al límite
Reportes mensuales automáticos	Resumen por email o push notification
Comparativa mes vs mes	Gráficas históricas
Logros y badges	Sistema de achievements basado en ChivoCoins
---
Fuera de Alcance (nunca para Mi Chivito)
Conexión directa con bancos o APIs financieras
Múltiples usuarios / cuentas familiares compartidas
Inversiones o portafolios
Criptomonedas
---
Métricas de Éxito v1
Usuario registra al menos 1 transacción al día durante 7 días consecutivos
Tasa de onboarding completado > 70%
ChivoCoins acumulados visibles en el perfil del usuario
---
Reglas de Negocio — ChivoCoins
Estas reglas son canónicas. No cambiar sin actualizar este documento.
Acción	Coins
Registrar transacción	+10 coins
Bonus aleatorio (20% probabilidad)	+20 coins (en lugar de 10)
Racha de 3 días	+25 coins bonus
Racha de 7 días (y múltiplos de 7)	+75 coins bonus
Uso futuro de coins: descuentos en suscripción mensual (% por definir en v2).
