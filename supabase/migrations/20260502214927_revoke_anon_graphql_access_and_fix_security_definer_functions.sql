/*
  # Revoke anon/authenticated GraphQL visibility and fix SECURITY DEFINER functions

  1. Revoke SELECT from anon on all exposed tables and views
     - Tables: expense_categories, expense_subcategories, financial_goals,
       onboarding_responses, profiles, subscriptions, transactions,
       usage_logs, user_profiles, user_secrets
     - Views: v_archetype_distribution, v_emergency_fund, v_goal_type,
       v_income_frequency, v_leak_category, v_monthly_registrations,
       v_onboarding_summary, v_savings_method, v_surplus_behavior

  2. Revoke SELECT from authenticated on the same tables and views
     - Access is already governed by RLS policies; the table-level GRANT to
       the authenticated role is what makes objects visible in the GraphQL schema.
     - Revoking the schema-level privilege removes GraphQL exposure while RLS
       policies on the PostgREST/REST path remain in effect.

  3. Fix SECURITY DEFINER trigger functions
     - update_financial_goals_completed_at: switch to SECURITY INVOKER
     - update_financial_goals_updated_at: switch to SECURITY INVOKER
     - Also revoke public EXECUTE so they cannot be called directly via RPC

  Notes
  - REVOKE on tables removes the broad role-level SELECT grant; individual RLS
    policies that use auth.uid() are unaffected and continue to guard row access.
  - Trigger functions only need to run as the invoking user; SECURITY INVOKER
    is safer and sufficient.
*/

-- ============================================================
-- 1. Revoke anon SELECT on tables
-- ============================================================
REVOKE SELECT ON TABLE public.expense_categories       FROM anon;
REVOKE SELECT ON TABLE public.expense_subcategories    FROM anon;
REVOKE SELECT ON TABLE public.financial_goals          FROM anon;
REVOKE SELECT ON TABLE public.onboarding_responses     FROM anon;
REVOKE SELECT ON TABLE public.profiles                 FROM anon;
REVOKE SELECT ON TABLE public.subscriptions            FROM anon;
REVOKE SELECT ON TABLE public.transactions             FROM anon;
REVOKE SELECT ON TABLE public.usage_logs               FROM anon;
REVOKE SELECT ON TABLE public.user_profiles            FROM anon;
REVOKE SELECT ON TABLE public.user_secrets             FROM anon;

-- ============================================================
-- 2. Revoke authenticated SELECT on tables
-- ============================================================
REVOKE SELECT ON TABLE public.expense_categories       FROM authenticated;
REVOKE SELECT ON TABLE public.expense_subcategories    FROM authenticated;
REVOKE SELECT ON TABLE public.financial_goals          FROM authenticated;
REVOKE SELECT ON TABLE public.onboarding_responses     FROM authenticated;
REVOKE SELECT ON TABLE public.profiles                 FROM authenticated;
REVOKE SELECT ON TABLE public.subscriptions            FROM authenticated;
REVOKE SELECT ON TABLE public.transactions             FROM authenticated;
REVOKE SELECT ON TABLE public.usage_logs               FROM authenticated;
REVOKE SELECT ON TABLE public.user_profiles            FROM authenticated;
REVOKE SELECT ON TABLE public.user_secrets             FROM authenticated;

-- ============================================================
-- 3. Revoke anon SELECT on views
-- ============================================================
REVOKE SELECT ON public.v_archetype_distribution  FROM anon;
REVOKE SELECT ON public.v_emergency_fund          FROM anon;
REVOKE SELECT ON public.v_goal_type               FROM anon;
REVOKE SELECT ON public.v_income_frequency        FROM anon;
REVOKE SELECT ON public.v_leak_category           FROM anon;
REVOKE SELECT ON public.v_monthly_registrations   FROM anon;
REVOKE SELECT ON public.v_onboarding_summary      FROM anon;
REVOKE SELECT ON public.v_savings_method          FROM anon;
REVOKE SELECT ON public.v_surplus_behavior        FROM anon;

-- ============================================================
-- 4. Revoke authenticated SELECT on views
-- ============================================================
REVOKE SELECT ON public.v_archetype_distribution  FROM authenticated;
REVOKE SELECT ON public.v_emergency_fund          FROM authenticated;
REVOKE SELECT ON public.v_goal_type               FROM authenticated;
REVOKE SELECT ON public.v_income_frequency        FROM authenticated;
REVOKE SELECT ON public.v_leak_category           FROM authenticated;
REVOKE SELECT ON public.v_monthly_registrations   FROM authenticated;
REVOKE SELECT ON public.v_onboarding_summary      FROM authenticated;
REVOKE SELECT ON public.v_savings_method          FROM authenticated;
REVOKE SELECT ON public.v_surplus_behavior        FROM authenticated;

-- ============================================================
-- 5. Fix SECURITY DEFINER trigger functions → SECURITY INVOKER
--    and revoke direct EXECUTE from public roles
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_financial_goals_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_financial_goals_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_financial_goals_completed_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_financial_goals_updated_at()   FROM anon, authenticated;
