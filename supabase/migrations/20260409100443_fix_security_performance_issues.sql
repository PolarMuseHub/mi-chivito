/*
  # Fix Security and Performance Issues

  ## Summary
  Addresses all outstanding security advisor warnings across multiple categories.

  ## Changes

  ### 1. Foreign Key Indexes (Query Performance)
  - Add index on `expense_subcategories.main_category_id`
  - Add index on `transactions.subcategory_id`

  ### 2. RLS Policy Optimization (Auth Re-evaluation)
  Replace bare `auth.uid()` calls with `(select auth.uid())` to prevent
  per-row re-evaluation of the auth function, improving query performance at scale.
  Tables affected: `user_secrets`, `subscriptions`, `financial_goals`, `user_profiles`

  ### 3. Usage Logs - Always-True INSERT Policy
  Replace the unrestricted `Allow insert for all` policy on `usage_logs` with
  a policy that only allows authenticated users to insert their own records.

  ### 4. Drop Unused Indexes
  Remove indexes that have never been used, reducing write overhead:
  - idx_subscriptions_status, idx_subscriptions_trial_end
  - idx_profiles_tier, idx_transactions_user_id
  - idx_financial_goals_is_active, idx_financial_goals_created_at
  - idx_financial_goals_target_date, idx_user_profiles_onboarding_completed

  ### 5. Fix Function Search Path
  Set explicit `search_path = public` on trigger functions to prevent
  search path manipulation attacks.
*/

-- ============================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_expense_subcategories_main_category_id
  ON public.expense_subcategories(main_category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_subcategory_id
  ON public.transactions(subcategory_id);

-- ============================================================
-- 2. FIX RLS POLICIES - user_secrets
-- ============================================================

DROP POLICY IF EXISTS "Enable full access for owner secrets" ON public.user_secrets;

CREATE POLICY "Enable full access for owner secrets"
  ON public.user_secrets
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 3. FIX RLS POLICIES - subscriptions
-- ============================================================

DROP POLICY IF EXISTS "Can view own subscription data." ON public.subscriptions;

CREATE POLICY "Can view own subscription data."
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- ============================================================
-- 4. FIX RLS POLICIES - financial_goals
-- ============================================================

DROP POLICY IF EXISTS "Users can view own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can insert own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can update own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can delete own financial goals" ON public.financial_goals;

CREATE POLICY "Users can view own financial goals"
  ON public.financial_goals
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own financial goals"
  ON public.financial_goals
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own financial goals"
  ON public.financial_goals
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own financial goals"
  ON public.financial_goals
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. FIX RLS POLICIES - user_profiles
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 6. FIX usage_logs - REPLACE ALWAYS-TRUE INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "Allow insert for all" ON public.usage_logs;

CREATE POLICY "Authenticated users can insert own logs"
  ON public.usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 7. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.idx_subscriptions_status;
DROP INDEX IF EXISTS public.idx_subscriptions_trial_end;
DROP INDEX IF EXISTS public.idx_profiles_tier;
DROP INDEX IF EXISTS public.idx_transactions_user_id;
DROP INDEX IF EXISTS public.idx_financial_goals_is_active;
DROP INDEX IF EXISTS public.idx_financial_goals_created_at;
DROP INDEX IF EXISTS public.idx_financial_goals_target_date;
DROP INDEX IF EXISTS public.idx_user_profiles_onboarding_completed;

-- ============================================================
-- 8. FIX FUNCTION SEARCH PATHS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_financial_goals_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_financial_goals_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;
