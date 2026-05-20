/*
  # Add Frequency Column to Transactions Table

  1. Updates
    - Add `frequency` column to transactions table
      - Type: text
      - Optional field
      - Stores user-selected frequency for expense transactions
      - Valid values: 'Diario', 'Semanal', 'Mensual', 'Bimestral', 'Semestral', 'Anual', 'Irregular', 'Variable'
  
  2. Notes
    - Frequency is user-selectable per transaction
    - Allows users to override the default frequency from subcategory
    - Only applies to 'gasto' (expense) type transactions
*/

-- Add frequency column to transactions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'frequency'
  ) THEN
    ALTER TABLE transactions ADD COLUMN frequency text;
  END IF;
END $$;
