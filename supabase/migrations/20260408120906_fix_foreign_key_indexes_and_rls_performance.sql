/*
  # Fix Foreign Key Indexes and RLS Performance

  ## Changes Made
  
  1. **Add Indexes for Foreign Keys**
     - Add `idx_expense_subcategories_main_category_id` for better query performance on foreign key lookups
     - Add `idx_financial_goals_user_id` for better query performance on user-specific goal queries
     - Add `idx_transactions_subcategory_id` for better query performance on category-filtered transactions
  
  2. **Optimize RLS Policy Performance**
     - Fix `usage_logs` INSERT policy to use `(select current_setting(...))` instead of `current_setting(...)`
     - This prevents re-evaluation of the function for each row, improving performance at scale
  
  3. **Remove Unused Index**
     - Drop `idx_transactions_user_date` as it's not being used by queries
  
  ## Security & Performance Improvements
     - Foreign key indexes improve JOIN and WHERE clause performance
     - RLS policy optimization reduces function call overhead
     - Removing unused index reduces write overhead and storage
*/

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_expense_subcategories_main_category_id 
  ON expense_subcategories(main_category_id);

CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id 
  ON financial_goals(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_subcategory_id 
  ON transactions(subcategory_id);

-- Drop unused composite index
DROP INDEX IF EXISTS idx_transactions_user_date;

-- Optimize RLS policy on usage_logs for better performance
DROP POLICY IF EXISTS "Authenticated users can insert own logs" ON usage_logs;

CREATE POLICY "Authenticated users can insert own logs"
  ON usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    anonymous_id = (select current_setting('app.anonymous_id', true))
  );
