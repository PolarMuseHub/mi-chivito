/*
  # Update usage logs policies for authentication

  1. Policy Updates
    - Drop existing policies safely
    - Create new policies for both anonymous and authenticated users
    - Allow inserts for all users (anonymous and authenticated)
    - Allow users to read their own logs based on anonymous_id

  2. Security
    - Maintain RLS protection
    - Ensure proper access control for both user types
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON usage_logs;
DROP POLICY IF EXISTS "Users can read their own logs" ON usage_logs;
DROP POLICY IF EXISTS "Allow insert for all" ON usage_logs;
DROP POLICY IF EXISTS "Authenticated users can read their own logs" ON usage_logs;

-- Allow inserts for both anonymous and authenticated users
CREATE POLICY "Allow insert for all"
  ON usage_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow reading own logs for anonymous users
CREATE POLICY "Users can read their own logs"
  ON usage_logs
  FOR SELECT
  TO anon
  USING (anonymous_id = current_setting('app.anonymous_id', true));

-- Allow authenticated users to read their own logs (using anonymous_id)
CREATE POLICY "Authenticated users can read their own logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (anonymous_id = current_setting('app.anonymous_id', true));