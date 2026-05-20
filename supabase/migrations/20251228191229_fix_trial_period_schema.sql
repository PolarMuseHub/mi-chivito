/*
  # Fix Trial Period Schema

  ## Changes Made
  
  1. Schema Updates
    - Add `trial_start` column (timestamptz) - tracks when trial began
    - Add `cancel_at_period_end` column (boolean) - tracks if user cancelled subscription
    - Update status constraint to use 'trial' instead of 'trialing' for consistency
    
  2. Data Migration
    - Set default `cancel_at_period_end` to false for existing records
    
  3. Indexes
    - Add index on status for faster queries
    - Add index on trial_end for trial expiration checks
    
  ## Important Notes
  - Existing subscriptions will have null trial_start/trial_end (will be set by application logic)
  - Status 'trialing' is replaced with 'trial' for consistency with frontend code
  - All new subscriptions created via app will have trial dates set automatically
*/

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'trial_start'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN trial_start timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end boolean DEFAULT false;
  END IF;
END $$;

-- Update the status check constraint to use 'trial' instead of 'trialing'
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
  CHECK (status = ANY (ARRAY['trial'::text, 'active'::text, 'canceled'::text, 'past_due'::text]));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end);

-- Update existing null values for cancel_at_period_end
UPDATE subscriptions 
SET cancel_at_period_end = false 
WHERE cancel_at_period_end IS NULL;