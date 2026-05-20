# Recurring Transactions Database Migration

## Overview
This migration adds support for recurring transactions that automatically populate based on weekly, biweekly (catorcenal - every 14 days), bimonthly (quincenal - every 15 days), or monthly frequencies.

## Database Changes Required

The following SQL needs to be run on your Supabase database to add the recurring transaction columns:

```sql
-- Add is_recurring column to track if a transaction should repeat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE transactions ADD COLUMN is_recurring boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add recurrence_interval column to define how often to repeat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'recurrence_interval'
  ) THEN
    ALTER TABLE transactions ADD COLUMN recurrence_interval text CHECK (recurrence_interval IN ('weekly', 'biweekly', 'bimonthly', 'monthly'));
  END IF;
END $$;

-- Add next_occurrence column to track when to create the next transaction
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'next_occurrence'
  ) THEN
    ALTER TABLE transactions ADD COLUMN next_occurrence timestamptz;
  END IF;
END $$;

-- Add parent_transaction_id column to reference the original recurring transaction
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'parent_transaction_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN parent_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance when finding recurring transactions
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring, next_occurrence) WHERE is_recurring = true;

-- Create index for finding child transactions
CREATE INDEX IF NOT EXISTS idx_transactions_parent_id ON transactions(parent_transaction_id) WHERE parent_transaction_id IS NOT NULL;
```

## How to Apply

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL above
4. Execute the query

## Feature Description

### For Users:
- When creating a transaction, users can now check "Transacción Recurrente"
- They can select from multiple frequency options:
  - **Semanal** (weekly - every 7 days)
  - **Catorcenal** (biweekly - every 14 days)
  - **Quincenal** (bimonthly - every 15 days)
  - **Mensual** (monthly - same day each month)
- The system automatically generates new transactions based on the schedule
- Recurring transactions show a badge with their frequency (Semanal, Catorcenal, Quincenal, or Mensual)
- Auto-generated transactions show an "Auto" badge

### Technical Details:
- **is_recurring**: Boolean flag indicating if the transaction should repeat
- **recurrence_interval**: One of 'weekly', 'biweekly', 'bimonthly', or 'monthly'
- **next_occurrence**: Timestamp when the next transaction should be created
- **parent_transaction_id**: Links auto-generated transactions to their parent

### How It Works:
1. User creates a transaction and marks it as recurring
2. System calculates the next occurrence date
3. Every minute, the app checks if any recurring transactions are due
4. When due, it creates a new transaction and updates the next occurrence
5. Original recurring transactions remain in the system as templates
6. Auto-generated transactions reference their parent via parent_transaction_id

## Important Notes

- The feature works client-side using localStorage for now
- For full Supabase integration, the migration SQL above must be applied
- The checking interval is 60 seconds (1 minute)
- Recurring transactions generate automatically when the app is open
