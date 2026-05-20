/*
  # Fix Remaining Security and Performance Issues

  ## Summary
  Addresses the remaining security advisor warnings.

  ## Changes

  ### 1. Add Missing Foreign Key Index
  - Add index on `transactions.user_id` to cover the `transactions_user_id_fkey` foreign key
    and to support efficient RLS policy checks on the transactions table.

  ### 2. Drop Unused Indexes
  - `idx_expense_subcategories_main_category_id` - added previously but not used by the query planner
  - `idx_transactions_subcategory_id` - added previously but not used by the query planner

  ### 3. Fix usage_logs INSERT Policy (Always-True WITH CHECK)
  - Add a nullable `user_id` column to `usage_logs` to tie authenticated inserts to
    the inserting user's identity
  - Replace the always-true `WITH CHECK (true)` policy with a meaningful check:
    `WITH CHECK ((select auth.uid()) = user_id)`, ensuring each authenticated user
    can only insert rows attributed to their own user ID
*/

-- ============================================================
-- 1. ADD MISSING FOREIGN KEY INDEX FOR transactions.user_id
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON public.transactions(user_id);

-- ============================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.idx_expense_subcategories_main_category_id;
DROP INDEX IF EXISTS public.idx_transactions_subcategory_id;

-- ============================================================
-- 3. FIX usage_logs INSERT POLICY - add user_id column
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'usage_logs'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.usage_logs
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can insert own logs" ON public.usage_logs;

CREATE POLICY "Authenticated users can insert own logs"
  ON public.usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
