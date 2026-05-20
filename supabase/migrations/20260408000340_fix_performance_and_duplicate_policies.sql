/*
  # Fix Performance Issues and Remove Duplicate Policies

  This migration addresses all remaining security audit findings:

  ## 1. Add Missing Indexes on Foreign Keys
    
  **Problem**: Foreign keys without indexes cause suboptimal query performance
  **Fix**: Add indexes to improve JOIN and foreign key lookup performance
    
  Tables affected:
  - `expense_subcategories.main_category_id` - references expense_categories
  - `transactions.subcategory_id` - references expense_subcategories

  ## 2. Optimize Financial Goals RLS Policies
    
  **Problem**: RLS policies re-evaluate auth.uid() for each row, causing performance degradation
  **Fix**: Wrap auth.uid() with (select auth.uid()) to evaluate once per query
    
  Policies optimized:
  - "Users can view own financial goals"
  - "Users can insert own financial goals"
  - "Users can update own financial goals"
  - "Users can delete own financial goals"

  ## 3. Remove Duplicate Policies on Transactions Table
    
  **Problem**: Multiple permissive policies for the same operation cause confusion
  **Fix**: Keep optimized "Enable X for owner" policies, remove older "Users can X" policies
    
  Duplicate policies removed:
  - "Users can view own transactions" (keeping "Enable select for owner")
  - "Users can insert own transactions" (keeping "Enable insert for owner")
  - "Users can update own transactions" (keeping "Enable update for owner")
  - "Users can delete own transactions" (keeping "Enable delete for owner")

  ## 4. Remove Overly Permissive Usage Logs Policy
    
  **Problem**: "Allow insert for all" policy allows anyone (even unauthenticated) to insert logs
  **Fix**: Remove this policy, keeping only "Authenticated users can insert logs"
    
  This closes the security vulnerability where anonymous users could spam logs.

  ## 5. Impact Summary
    
  - ✅ Improved query performance on foreign key relationships
  - ✅ Faster RLS policy evaluation on financial_goals table
  - ✅ Cleaner policy structure with no duplicates
  - ✅ Enhanced security by restricting log inserts to authenticated users
  - ✅ No breaking changes to application functionality
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- Index for expense_subcategories.main_category_id foreign key
-- Improves performance when joining expense_subcategories with expense_categories
CREATE INDEX IF NOT EXISTS idx_expense_subcategories_main_category_id 
  ON public.expense_subcategories(main_category_id);

-- Index for transactions.subcategory_id foreign key
-- Improves performance when joining transactions with expense_subcategories
CREATE INDEX IF NOT EXISTS idx_transactions_subcategory_id 
  ON public.transactions(subcategory_id);

-- ============================================================================
-- 2. OPTIMIZE FINANCIAL GOALS RLS POLICIES
-- ============================================================================

-- Drop existing financial_goals policies
DROP POLICY IF EXISTS "Users can view own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can insert own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can update own financial goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can delete own financial goals" ON public.financial_goals;

-- Recreate with optimized (select auth.uid()) wrapper for better performance
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

-- ============================================================================
-- 3. REMOVE DUPLICATE POLICIES ON TRANSACTIONS TABLE
-- ============================================================================

-- Remove older "Users can X own transactions" policies
-- Keep the newer "Enable X for owner" policies which are already optimized
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- Note: "Enable X for owner" policies already exist from previous migration
-- with optimized (select auth.uid()) syntax

-- ============================================================================
-- 4. REMOVE OVERLY PERMISSIVE USAGE LOGS INSERT POLICY
-- ============================================================================

-- Remove the policy that allows unauthenticated inserts
DROP POLICY IF EXISTS "Allow insert for all" ON public.usage_logs;

-- Keep "Authenticated users can insert logs" policy from previous migration
-- This ensures only logged-in users can create usage logs
