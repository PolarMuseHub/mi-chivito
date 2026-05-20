/*
  # Fix Indexes and Performance Issues

  ## Summary
  Resolves performance and security advisor warnings from Supabase.

  ## Changes

  1. **Add Missing Foreign Key Index**
     - Add `idx_transactions_user_id` on `transactions(user_id)`
     - This column is used by RLS policies and is critical for query performance
     - Without this index, every RLS check requires a full table scan

  2. **Drop Unused Indexes**
     - Drop `idx_expense_subcategories_main_category_id` (not used by any query)
     - Drop `idx_financial_goals_user_id` (not used; RLS uses auth.uid() = user_id directly)
     - Drop `idx_transactions_subcategory_id` (not used by any active query)
     - Unused indexes add write overhead on every INSERT/UPDATE/DELETE with no read benefit

  ## Notes
  - Auth DB connection strategy and leaked password protection must be configured
    manually in the Supabase dashboard under Authentication > Settings
*/

-- Add missing index on transactions.user_id (unindexed foreign key)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions(user_id);

-- Drop unused indexes to reduce write overhead
DROP INDEX IF EXISTS idx_expense_subcategories_main_category_id;
DROP INDEX IF EXISTS idx_financial_goals_user_id;
DROP INDEX IF EXISTS idx_transactions_subcategory_id;
