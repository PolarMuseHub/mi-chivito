# Onboarding System Setup Guide

This document explains the multi-step onboarding flow implementation for Mi Chivito.

## Overview

The onboarding system personalizes the user experience right after registration with 6 interactive screens:

1. **La Promesa (The Hook)** - Introduces the app's value proposition
2. **Identidad (Customize Chivito)** - User names and customizes their Chivito
3. **Profile Questions** - 5 diagnostic questions to understand user behavior
4. **Goal Setup** - User sets their financial goal
5. **Commitment** - Final screen that seals the deal

## Database Setup

### Step 1: Create the user_profiles table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  onboarding_completed boolean DEFAULT false,
  chivito_name varchar(100),
  chivito_accessories jsonb DEFAULT '[]'::jsonb,

  income_frequency varchar(50),
  savings_location varchar(50),
  spending_attitude varchar(50),
  money_leak varchar(50),
  emergency_fund boolean,

  savings_goal_type varchar(50),
  savings_goal_name varchar(200),
  savings_goal_amount decimal(10,2),

  risk_level varchar(20),
  impulsivity_score integer DEFAULT 1,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Step 2: Enable Row Level Security

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create RLS Policies

```sql
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Step 4: Create Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);
```

## Features

### Screen 1: La Promesa (The Hook)
- Introduces the core value proposition
- "Tú guardas la lana, yo llevo las cuentas"
- Simple call-to-action button

### Screen 2: Identidad (Customize Chivito)
- User names their Chivito (endowment effect)
- Choose accessories (sunglasses, cap, bandana, bow tie, or none)
- Personalizes the experience

### Screen 3: Profile Questions
- 5 diagnostic questions with progress bar
- Questions cover:
  - Income frequency
  - Savings location
  - Spending attitude
  - Money leaks
  - Emergency fund status
- Calculates risk_level and impulsivity_score automatically

### Screen 4-5: Goal Setup
- Two-step process:
  1. Select goal type (purchase, debt, event, emergency)
  2. Enter goal details (name and amount)
- Creates both user_profile entry and financial_goal entry

### Screen 6: Commitment (The Pact)
- Final commitment screen
- "Si tú no haces trampa, yo te llevo a la meta"
- Completes onboarding and redirects to dashboard

## User Flow

```
Registration → Check onboarding_completed
  ↓
  false → Show Onboarding Flow (6 screens)
  ↓
  Complete → Set onboarding_completed = true → Dashboard

  true → Dashboard (with personalized Chivito)
```

## Data Collected

### Screen 2: Customization
- `chivito_name`: User's chosen name for their Chivito
- `chivito_accessories`: Array of selected accessories

### Screen 3: Profile Questions
- `income_frequency`: 'daily', 'weekly', 'biweekly', 'sporadic'
- `savings_location`: 'cash_home', 'bank', 'trusted_person', 'wallet'
- `spending_attitude`: 'saver', 'foodie', 'responsible_payer', 'impulsive'
- `money_leak`: 'food_drinks', 'transport', 'phone', 'family_loans'
- `emergency_fund`: boolean

### Screen 4-5: Goal Information
- `savings_goal_type`: 'purchase', 'debt', 'event', 'emergency'
- `savings_goal_name`: User's goal description
- `savings_goal_amount`: Target amount

### Calculated Fields
- `risk_level`: 'low', 'medium', 'high' (calculated from answers)
- `impulsivity_score`: 1-4 (calculated from spending_attitude)

## Dashboard Personalization

After completing onboarding, the dashboard displays:

1. **Chivito Display** - Shows the personalized Chivito with name and accessories
2. **Goal Display** - Shows the created financial goal
3. **Streak Counter** - Tracks daily activity

## Testing the Onboarding

1. Create a new user account
2. Upon first login, the onboarding flow will automatically start
3. Complete all 6 screens
4. You'll be redirected to the dashboard with your personalized Chivito

## Future Enhancements

The collected profile data can be used for:

- **Personalized notifications**: Use `impulsivity_score` to determine frequency
- **Smart alerts**: Use `money_leak` to provide targeted warnings
- **Risk warnings**: Use `savings_location` to provide security tips
- **Emergency fund suggestions**: Use `emergency_fund` status to recommend safety nets

## Files Created

### Components
- `/src/components/onboarding/OnboardingIntro.tsx` - Screen 1
- `/src/components/onboarding/CustomizeChivito.tsx` - Screen 2
- `/src/components/onboarding/ProfileQuestions.tsx` - Screen 3
- `/src/components/onboarding/GoalSetup.tsx` - Screen 4-5
- `/src/components/onboarding/Commitment.tsx` - Screen 6
- `/src/components/OnboardingFlow.tsx` - Main wrapper
- `/src/components/ChivitoDisplay.tsx` - Dashboard display

### Utilities
- `/src/utils/onboarding.ts` - All onboarding-related functions

### Updates
- `/src/App.tsx` - Integrated onboarding routing logic
