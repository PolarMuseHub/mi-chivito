# Financial Goals System - Database Migration

## Overview
This migration adds a financial goals system that allows users to set and track savings goals for purchases, trips, debts, vehicles, emergencies, and more.

## Database Changes Required

Execute the following SQL in your Supabase SQL Editor:

```sql
/*
  # Add Financial Goals System

  1. New Table
    - `financial_goals` - Stores user financial goals and savings targets

  2. Security
    - RLS enabled
    - Users can only access their own goals
    - Indexes for query performance

  3. Features
    - Multiple goal types (Compra, Viaje, Deuda, Vehículo, Emergencias, Otra)
    - Target amount and optional target date
    - Optional reason/motivation field
    - Track active vs completed goals
    - Progress tracking ready (can be extended)
*/

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
```

## How to Apply

1. Go to your Supabase Dashboard: https://ijhaligcgijvjsamotxk.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the entire SQL block above
4. Click "Run" to execute

## Table Structure

### financial_goals
- **id**: Unique identifier (UUID)
- **user_id**: Links to authenticated user
- **goal_name**: Name/description of the goal (e.g., "Cambiar mi celular")
- **goal_type**: Category (Compra, Viaje, Deuda, Vehículo, Emergencias, Otra)
- **target_amount**: Amount needed to achieve the goal
- **target_date**: Optional deadline for the goal
- **goal_reason**: Optional motivation text
- **is_active**: Whether goal is currently being worked on
- **current_amount**: Amount saved so far (for future progress tracking)
- **created_at**: When the goal was created
- **updated_at**: Last modification timestamp
- **completed_at**: When the goal was completed (auto-set when is_active becomes false)

## Features

### Goal Types
1. **Compra**: General purchases
2. **Viaje**: Travel/vacation savings
3. **Deuda**: Debt payment goals
4. **Vehículo**: Vehicle purchase
5. **Emergencias**: Emergency fund
6. **Otra**: Other goals

### Automatic Triggers
- **updated_at**: Automatically updates on any modification
- **completed_at**: Automatically sets when goal is marked inactive

### Progress Tracking
The `current_amount` field is ready for future progress tracking features where users can:
- Add funds toward their goal
- Track percentage complete
- See remaining amount needed
- Visualize progress with charts

## Testing Queries

### View all active goals for a user
```sql
SELECT * FROM financial_goals
WHERE user_id = 'YOUR_USER_ID'
AND is_active = true
ORDER BY created_at DESC;
```

### Check goal progress
```sql
SELECT
  goal_name,
  goal_type,
  target_amount,
  current_amount,
  ROUND((current_amount / target_amount * 100), 2) as progress_percentage,
  target_amount - current_amount as remaining_amount
FROM financial_goals
WHERE user_id = 'YOUR_USER_ID'
AND is_active = true;
```

### Goals by type
```sql
SELECT
  goal_type,
  COUNT(*) as goal_count,
  SUM(target_amount) as total_target,
  AVG(target_amount) as avg_target
FROM financial_goals
WHERE is_active = true
GROUP BY goal_type
ORDER BY goal_count DESC;
```

## Security Notes

- Row Level Security (RLS) is enabled
- Users can only access their own goals
- All CRUD operations are restricted to authenticated users
- Policies enforce user_id matching for all operations

## Future Enhancements

Possible extensions to this system:
1. **Progress Updates**: Link transactions to goals
2. **Goal Milestones**: Celebrate 25%, 50%, 75% completion
3. **Goal Reminders**: Notify users about approaching deadlines
4. **Goal Sharing**: Share progress with accountability partners
5. **Goal Templates**: Pre-defined goal templates with suggestions
6. **Multiple Goals**: Priority ranking for multiple simultaneous goals
7. **Goal History**: Track completed goals and achievements
