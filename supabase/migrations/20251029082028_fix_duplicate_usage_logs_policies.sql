/*
  # Fix Duplicate RLS Policies on usage_logs

  1. Issues Fixed
    - Remove duplicate SELECT policies on usage_logs table
    - Keep only one optimized policy for authenticated users to read their own logs
    - Policies are already using optimized (select auth.uid()) pattern

  2. Security Impact
    - Maintains same security level with single policy
    - Removes redundant policy that caused warning
    - No change to access control, just cleaner implementation
*/

-- Drop the duplicate policies
DROP POLICY IF EXISTS "Users can read their own logs" ON usage_logs;
DROP POLICY IF EXISTS "Authenticated users can read their own logs" ON usage_logs;

-- Create a single optimized policy
CREATE POLICY "Authenticated users can read their own logs"
  ON usage_logs FOR SELECT
  TO authenticated
  USING (anonymous_id = (select auth.uid()::text));
