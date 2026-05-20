-- =====================================================
-- FINANCIAL GOALS TABLE MIGRATION
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_name text NOT NULL,
  goal_type text CHECK (goal_type IN ('Compra', 'Viaje', 'Deuda', 'Vehículo', 'Emergencias', 'Otra')) NOT NULL,
  target_amount numeric(12, 2) NOT NULL CHECK (target_amount > 0),
  target_date date,
  goal_reason text,
  is_active boolean DEFAULT true NOT NULL,
  current_amount numeric(12, 2) DEFAULT 0 NOT NULL CHECK (current_amount >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_goals
CREATE POLICY "Users can view own financial goals"
  ON financial_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial goals"
  ON financial_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial goals"
  ON financial_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial goals"
  ON financial_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_is_active ON financial_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_goals_created_at ON financial_goals(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON financial_goals(target_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS financial_goals_updated_at ON financial_goals;
CREATE TRIGGER financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goals_updated_at();

-- Create function to automatically set completed_at when goal is marked inactive
CREATE OR REPLACE FUNCTION update_financial_goals_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set completed_at
DROP TRIGGER IF EXISTS financial_goals_completed_at ON financial_goals;
CREATE TRIGGER financial_goals_completed_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goals_completed_at();
