DATA_MODEL.md — Mi Chivito
Generado por Arqueología · Abril 2026

Tablas en Supabase (producción)
auth.users (gestionada por Supabase)
Tabla de autenticación nativa. No tocar directamente.

profiles
Perfil básico vinculado a auth. Creada en migración inicial.
ColumnaTipoNotasiduuid PK= auth.users.idcreated_attimestamptz

user_profiles
Perfil rico del onboarding. Contiene la personalización del Chivito.
ColumnaTipoNotasiduuid PKuser_iduuid FK → auth.usersonboarding_completedbooleanDefault falsechivito_nametextNombre elegido para la mascotachivito_accessoriestext[]Accesorios seleccionadosincome_frequencytextFrecuencia de ingresosavings_locationtextDónde ahorra el usuariospending_attitudetextActitud ante el gastomoney_leaktextPrincipal fuga de dineroemergency_fundboolean¿Tiene fondo de emergencia?savings_goal_typetextTipo de metasavings_goal_nametextsavings_goal_amountnumericrisk_leveltextimpulsivity_scorenumericDefault 1created_attimestamptzupdated_attimestamptz

transactions
Tabla core de la app. ⚠️ EXISTE en Supabase pero FinanceContext la ignora y usa localStorage.
ColumnaTipoNotasiduuid PKuser_iduuid FK → auth.userstypetextingreso | gasto | deuda | ahorroamountnumeric≥ 0categorytextNombre de categoría principalsubcategory_idtext FK → expense_subcategoriesfrequencytextFrecuencia del gastodatetimestamptzis_recurringbooleanrecurrence_intervaltextweekly | biweekly | bimonthly | monthlynext_occurrencetimestamptzparent_transaction_iduuidPara transacciones recurrentescreated_attimestamptz

expense_categories
Catálogo de 7 categorías principales. Solo lectura.
idnameiconVSVivienda y Servicios🏠ABAlimentos y Bebidas🍽️TRTransporte🚗SBSalud y Bienestar💊EFEducación y Familia👨‍👩‍👧‍👦TDTecnología💻FLFinanciero y Legal💰

expense_subcategories
91 subcategorías. Solo lectura.
ColumnaTipoNotasidtext PKEj: VS1, AB2-3main_category_idtext FK → expense_categoriesmain_categorytextNombre desnormalizadosubcategorytextexamplestext[]frequencytextFrecuencia sugeridatypetextEsencial | Deseo | Obligatorio | Variable

financial_goals
Metas financieras del usuario.
ColumnaTipoNotasiduuid PKuser_iduuid FK → auth.usersgoal_nametextgoal_typetextCompra | Viaje | Deuda | Vehículo | Emergencias | Otratarget_amountnumeric(12,2)> 0target_datedateNullablegoal_reasontextNullableis_activebooleanDefault truecurrent_amountnumeric(12,2)Default 0created_attimestamptzupdated_attimestamptzAuto-actualizado por triggercompleted_attimestamptzAuto-seteado por trigger cuando is_active → false

user_streaks
Rachas de uso diario. Referenciada por streakLogic.ts.
ColumnaTipoNotasuser_iduuid PK FK → auth.userscurrent_streakintegerlongest_streakintegerlast_activity_datetimestamptzstreak_broken_attimestamptzstreak_broken_countintegerDefault 0created_attimestamptzupdated_attimestamptz

streak_events
Histórico de eventos de racha.
ColumnaTipoNotasuser_iduuid FK → auth.usersevent_typetextstreak_started | streak_continued | streak_brokenstreak_valueintegerdays_since_last_activityinteger

subscriptions
Control de suscripciones Stripe.
ColumnaTipoNotasiduuid PK= auth.users.idstripe_customer_idtextstripe_subscription_idtextstatustexttrial | active | canceled | past_duetrial_starttimestamptztrial_endtimestamptzcurrent_period_endtimestamptzcancel_at_period_endbooleanDefault false

usage_logs
Analytics anónimos de eventos de uso.
ColumnaTipoNotasiduuid PKanonymous_idtextuser_iduuid FK → auth.usersNullableeventtextNombre del eventotimestamptimestamptzmetadatajsonb

⚠️ Tabla pendiente de crear
user_coins ← PRÓXIMA MIGRACIÓN (ChivoCoins a Supabase)
Actualmente los ChivoCoins viven en localStorage. Esta tabla los persistirá en Supabase.
ColumnaTipoNotasuser_iduuid PK FK → auth.userscoinsintegerDefault 0total_earnedintegerHistorial acumuladolast_updatedtimestamptz

Relaciones Clave
auth.users
  ├── profiles (1:1)
  ├── user_profiles (1:1) — onboarding + chivito
  ├── transactions (1:N)
  ├── financial_goals (1:N)
  ├── user_streaks (1:1)
  ├── streak_events (1:N)
  ├── subscriptions (1:1)
  └── usage_logs (1:N)

transactions.subcategory_id → expense_subcategories.id
expense_subcategories.main_category_id → expense_categories.id
