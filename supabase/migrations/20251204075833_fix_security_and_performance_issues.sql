/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database:

  ## 1. Performance Optimizations
    
  ### Add Missing Index
    - Add index on `transactions.user_id` foreign key for improved query performance
    
  ### Optimize RLS Policies
    - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
    - Replace `current_setting()` with `(select current_setting())` in usage_logs policies
    - This prevents function re-evaluation for each row, improving query performance at scale
    
  ## 2. Tables Affected
    
  ### transactions
    - Add covering index on user_id foreign key
    - Optimize 4 RLS policies: select, insert, update, delete
    
  ### profiles
    - Optimize 3 RLS policies: select, insert, update
    
  ### usage_logs
    - Optimize 2 RLS policies that use current_setting()
    
  ## 3. Security Notes
    - All RLS policies maintain the same security logic
    - Only the execution performance is improved
    - No changes to access control or permissions
*/

-- Add index on transactions.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- ============================================================================
-- OPTIMIZE TRANSACTIONS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable select for owner" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for owner" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for owner" ON public.transactions;
DROP POLICY IF EXISTS "Enable delete for owner" ON public.transactions;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Enable select for owner"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Enable insert for owner"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Enable update for owner"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Enable delete for owner"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- OPTIMIZE PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO public
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = id);

-- ============================================================================
-- OPTIMIZE USAGE_LOGS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Authenticated users can read their own logs" ON public.usage_logs;

-- Recreate with optimized current_setting() calls
CREATE POLICY "Users can read their own logs"
  ON public.usage_logs
  FOR SELECT
  TO anon
  USING (anonymous_id = (select current_setting('app.anonymous_id'::text, true)));

CREATE POLICY "Authenticated users can read their own logs"
  ON public.usage_logs
  FOR SELECT
  TO authenticated
  USING (anonymous_id = (select current_setting('app.anonymous_id'::text, true)));
