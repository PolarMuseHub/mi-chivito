# Streak Tracking System - Database Migration

## Overview
This migration adds a comprehensive streak tracking system to encourage daily engagement with the finance app. Users earn streaks by logging transactions or viewing their dashboard daily, with timezone-aware tracking for Mexico City (America/Mexico_City, UTC-6).

## Database Changes Required

Execute the following SQL in your Supabase SQL Editor:

```sql
/*
  # Add Streak Tracking System

  1. New Tables
    - `user_streaks` - Stores current and historical streak data per user
    - `streak_events` - Analytics table tracking all streak-related events

  2. Security
    - RLS enabled on both tables
    - Users can only access their own streak data
    - Comprehensive indexes for query performance

  3. Features
    - Automatic streak calculation based on Mexico City timezone
    - Break tracking and analytics
    - Historical longest streak tracking
*/

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  last_activity_date timestamptz,
  streak_broken_at timestamptz,
  streak_broken_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create streak_events table for analytics
CREATE TABLE IF NOT EXISTS streak_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text CHECK (event_type IN ('streak_continued', 'streak_broken', 'streak_started')) NOT NULL,
  streak_value integer NOT NULL,
  days_since_last_activity integer NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_streaks
CREATE POLICY "Users can view own streak data"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data"
  ON user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak data"
  ON user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for streak_events
CREATE POLICY "Users can view own streak events"
  ON streak_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak events"
  ON streak_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_activity ON user_streaks(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_streak_events_user_id ON streak_events(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_events_timestamp ON streak_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_streak_events_type ON streak_events(event_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS user_streaks_updated_at ON user_streaks;
CREATE TRIGGER user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streaks_updated_at();
```

## How to Apply

1. Go to your Supabase Dashboard: https://ijhaligcgijvjsamotxk.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the entire SQL block above
4. Click "Run" to execute

## Feature Details

### User Streaks Table
- **user_id**: Links to authenticated user
- **current_streak**: Active streak count (days)
- **longest_streak**: All-time record
- **last_activity_date**: Last activity timestamp (Mexico City timezone)
- **streak_broken_at**: When the streak was last broken
- **streak_broken_count**: Total times the user has broken their streak

### Streak Events Table (Analytics)
Tracks every streak event for analysis:
- **streak_continued**: User maintained streak by returning next day
- **streak_broken**: User missed a day and broke their streak
- **streak_started**: New streak began (either first time or after break)

### Streak Logic
- **Increments**: When user returns on the next calendar day
- **Maintains**: Same-day activity doesn't change streak
- **Breaks**: Missing 24+ hours from last activity
- **Timezone**: All calculations use America/Mexico_City (UTC-6)

### Triggers
Streak checking occurs on:
- Transaction creation
- Dashboard view
- Balance display view
- Any finance context interaction

## UI Elements Added

1. **Streak Counter**: Prominent flame emoji 🔥 with count at top of dashboard
2. **Toast Notifications**: Celebration message when streak increments
3. **Animations**: Bounce effect on streak counter when incrementing
4. **Color Coding**: Orange (#FF6B35) when active, gray when 0

## Testing

After applying the migration:
1. Log in to the app
2. Create a transaction - should initialize streak to 1
3. Wait until the next day (or test with modified dates)
4. Create another transaction - streak should increment to 2
5. Check the toast notification appears
6. Wait 2+ days - streak should break and restart at 1

## Analytics Queries

View streak engagement:
```sql
-- Most engaged users by current streak
SELECT user_id, current_streak, longest_streak, last_activity_date
FROM user_streaks
ORDER BY current_streak DESC
LIMIT 10;

-- Streak break frequency
SELECT
  event_type,
  COUNT(*) as count,
  AVG(days_since_last_activity) as avg_days_missed
FROM streak_events
GROUP BY event_type;

-- Daily active users with streaks
SELECT
  DATE(timestamp AT TIME ZONE 'America/Mexico_City') as date,
  COUNT(DISTINCT user_id) as active_users
FROM streak_events
WHERE event_type = 'streak_continued'
AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp AT TIME ZONE 'America/Mexico_City')
ORDER BY date DESC;
```
