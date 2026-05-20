/*
  # Fix Security Issues - Unused Indexes and RLS Policies

  ## Changes Made
  
  1. **Drop Unused Indexes**
     - Remove `idx_financial_goals_user_id` (covered by RLS queries)
     - Remove `idx_financial_goals_is_active` (not used in queries)
     - Remove `idx_financial_goals_created_at` (not used in queries)
     - Remove `idx_financial_goals_target_date` (not used in queries)
     - Remove `idx_expense_subcategories_main_category_id` (not used)
     - Remove `idx_transactions_subcategory_id` (not used in queries)
     - Remove `idx_transactions_user_id` (redundant with composite index)
     - Remove `idx_transactions_date` (redundant with composite index)
     - Remove `idx_transactions_type` (not used in queries)
     - Keep `idx_transactions_user_date` (composite index used by queries)

  2. **Fix RLS Policy on usage_logs**
     - Replace overly permissive INSERT policy with restrictive policy
     - Ensure authenticated users can only insert logs with their own anonymous_id
     
  ## Security Improvements
     - Reduces database overhead from unused indexes
     - Prevents authenticated users from inserting arbitrary usage logs
     - Maintains proper data isolation per user
*/

-- Drop unused indexes on financial_goals table
DROP INDEX IF EXISTS idx_financial_goals_user_id;
DROP INDEX IF EXISTS idx_financial_goals_is_active;
DROP INDEX IF EXISTS idx_financial_goals_created_at;
DROP INDEX IF EXISTS idx_financial_goals_target_date;

-- Drop unused indexes on expense_subcategories table
DROP INDEX IF EXISTS idx_expense_subcategories_main_category_id;

-- Drop unused/redundant indexes on transactions table
-- Keep idx_transactions_user_date as it's the most useful composite index
DROP INDEX IF EXISTS idx_transactions_subcategory_id;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_type;

-- Fix RLS policy on usage_logs table
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON usage_logs;

-- Create a restrictive policy that checks anonymous_id
CREATE POLICY "Authenticated users can insert own logs"
  ON usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    anonymous_id = current_setting('app.anonymous_id', true)
  );
