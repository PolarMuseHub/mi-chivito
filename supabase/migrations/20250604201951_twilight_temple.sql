/*
  # Create usage logs table

  1. New Tables
    - `usage_logs`
      - `id` (uuid, primary key)
      - `anonymous_id` (text): Anonymous user identifier
      - `event` (text): Name of the action taken
      - `timestamp` (timestamptz): When the event occurred
      - `metadata` (jsonb): Additional event data (optional)

  2. Security
    - Enable RLS on `usage_logs` table
    - Add policy for inserting logs
*/

CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text NOT NULL,
  event text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts"
  ON usage_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading own logs only
CREATE POLICY "Users can read their own logs"
  ON usage_logs
  FOR SELECT
  TO anon
  USING (anonymous_id = current_setting('app.anonymous_id', true));