/*
  # Optimize RLS Policies for Performance

  1. Changes
    - Drop and recreate all RLS policies with optimized auth.uid() calls
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row
    - Apply optimization to usage_logs, profiles, and transactions tables

  2. Tables Affected
    - `usage_logs` - 2 policies optimized
    - `profiles` - 3 policies optimized  
    - `transactions` - 4 policies optimized

  3. Performance Impact
    - Prevents auth function re-evaluation for each row
    - Significantly improves query performance at scale
    - Single evaluation per query instead of per-row evaluation
*/

-- Optimize usage_logs policies
DROP POLICY IF EXISTS "Users can read their own logs" ON usage_logs;
DROP POLICY IF EXISTS "Authenticated users can read their own logs" ON usage_logs;

CREATE POLICY "Users can read their own logs"
  ON usage_logs FOR SELECT
  TO authenticated
  USING (anonymous_id = (select auth.uid()::text));

CREATE POLICY "Authenticated users can read their own logs"
  ON usage_logs FOR SELECT
  TO authenticated
  USING (anonymous_id = (select auth.uid()::text));

-- Optimize profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Optimize transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
