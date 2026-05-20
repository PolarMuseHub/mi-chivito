/*
  # Create transactions table for Mi Chivito finance tracker

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - Unique identifier for each transaction
      - `user_id` (uuid, foreign key) - References auth.users, tracks transaction ownership
      - `type` (text) - Transaction type: 'ingreso', 'gasto', 'deuda', or 'ahorro'
      - `amount` (numeric) - Transaction amount in decimal format
      - `category` (text, optional) - Category name for organizing transactions
      - `date` (timestamptz) - Date and time when transaction occurred
      - `created_at` (timestamptz) - Timestamp when record was created

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for authenticated users to insert their own transactions
    - Add policy for authenticated users to update their own transactions
    - Add policy for authenticated users to delete their own transactions

  3. Indexes
    - Index on user_id for faster queries
    - Index on date for time-based filtering
    - Index on type for transaction type filtering
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ingreso', 'gasto', 'deuda', 'ahorro')),
  amount numeric NOT NULL CHECK (amount >= 0),
  category text,
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
