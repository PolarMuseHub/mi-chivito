# Streak Tracking System - Complete Implementation Guide

## Overview
A comprehensive streak tracking system has been implemented to encourage daily engagement with Mi Chivito finance app. Users earn daily streaks by logging transactions or viewing their dashboard, with timezone-aware tracking for Mexico City (America/Mexico_City, UTC-6).

## Features Implemented

### 1. Daily Streak Counter
- **Display**: Prominent flame emoji 🔥 with streak count at the top of the dashboard
- **Visual States**:
  - Active (streak > 0): Orange flame (#FF6B35) with bold number
  - Inactive (streak = 0): Gray flame with neutral colors
- **Personal Record**: Shows longest streak achieved alongside current streak
- **Motivational Messages**:
  - Active: "¡Sigue así, Chivito! 🎉"
  - Inactive: "Comienza tu racha hoy"

### 2. Streak Logic
- **Increment**: When user returns on the next calendar day (consecutive days)
- **Maintain**: Same-day activity doesn't change the streak
- **Break**: Missing 24+ hours from last activity resets streak to 1
- **Timezone**: All calculations use America/Mexico_City (UTC-6)

### 3. Toast Notifications
- **Trigger**: When streak increments
- **Message**: "¡Día [NUMBER]! Estás dominando tus finanzas, Chivito! 🔥"
- **Style**: Green background (#10B981), top-center position
- **Duration**: 3 seconds
- **Animation**: Slide down + fade in (200ms), fade out (300ms)

### 4. Streak Counter Animation
- **Trigger**: When streak increments
- **Effect**: Scale from 1 to 1.2 and back to 1
- **Duration**: 300ms
- **Easing**: cubic-bezier(0.34, 1.56, 0.64, 1) - bounce effect

### 5. Database Integration
Two new tables in Supabase:
- **user_streaks**: Current and historical streak data per user
- **streak_events**: Analytics tracking for all streak events

## File Structure

### New Files Created
1. `/src/utils/streakLogic.ts` - Core streak calculation and database operations
2. `/src/components/StreakCounter.tsx` - Visual streak counter component
3. `/src/components/Toast.tsx` - Toast notification system
4. `/STREAK_TRACKING_MIGRATION.md` - Database migration instructions

### Modified Files
1. `/src/context/FinanceContext.tsx` - Added streak tracking integration
2. `/src/types/index.ts` - Extended FinanceState type with streak data
3. `/src/App.tsx` - Added StreakCounter and ToastContainer to UI
4. `/src/index.css` - Added bounce-scale animation keyframes

## Database Schema

### user_streaks Table
```typescript
{
  user_id: uuid (PK, FK to auth.users)
  current_streak: integer (default 0)
  longest_streak: integer (default 0)
  last_activity_date: timestamptz
  streak_broken_at: timestamptz (nullable)
  streak_broken_count: integer (default 0)
  created_at: timestamptz
  updated_at: timestamptz
}
```

### streak_events Table
```typescript
{
  event_id: uuid (PK)
  user_id: uuid (FK to auth.users)
  event_type: 'streak_continued' | 'streak_broken' | 'streak_started'
  streak_value: integer
  days_since_last_activity: integer
  timestamp: timestamptz
}
```

## How It Works

### 1. On App Load
```typescript
// FinanceContext.tsx
useEffect(() => {
  checkStreak(); // Check and update streak on mount
}, []);
```

### 2. On Transaction Added
```typescript
const addTransaction = (transaction) => {
  // ... create transaction
  setTransactions(prev => [newTransaction, ...prev]);

  // Check and update streak
  checkStreak();
};
```

### 3. Streak Calculation
```typescript
// streakLogic.ts - calculateAndUpdateStreak
const now = getDateInTimezone(); // Mexico City time
const today = getStartOfDay(now);
const lastActivity = getStartOfDay(lastActivityDate);
const daysDiff = getDaysDifference(today, lastActivity);

if (daysDiff === 0) {
  // Same day - no change
} else if (daysDiff === 1) {
  // Next day - increment streak
  current_streak += 1;
  showToast = true;
} else {
  // Missed day(s) - break streak
  current_streak = 1;
  streak_broken_at = now;
  streak_broken_count += 1;
}

// Update longest streak if needed
if (current_streak > longest_streak) {
  longest_streak = current_streak;
}
```

### 4. Toast Display
```typescript
// When streak increments
if (result.isIncrement) {
  const toastId = crypto.randomUUID();
  const message = `¡Día ${result.streak}! Estás dominando tus finanzas, Chivito! 🔥`;
  setToasts(prev => [...prev, { id: toastId, message }]);
}
```

### 5. UI Updates
```typescript
// App.tsx - AppContent component
const { streakData, toasts, removeToast } = useFinance();

return (
  <>
    {!streakData.loading && (
      <StreakCounter
        streak={streakData.currentStreak}
        longestStreak={streakData.longestStreak}
      />
    )}
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  </>
);
```

## API Reference

### Streak Functions (streakLogic.ts)

#### `getStreakData(userId: string): Promise<StreakData | null>`
Fetches current streak data for a user from the database.

#### `initializeStreak(userId: string): Promise<StreakData | null>`
Creates initial streak record for new users.

#### `calculateAndUpdateStreak(userId: string): Promise<StreakUpdateResult>`
Main function that calculates and updates streak based on Mexico City timezone.

**Returns:**
```typescript
{
  streak: number;           // Current streak value
  isIncrement: boolean;     // True if streak increased
  wasBroken: boolean;       // True if streak was broken
  isNewRecord: boolean;     // True if new personal best
}
```

#### `getStreakStats(userId: string): Promise<{ currentStreak, longestStreak, totalBreaks } | null>`
Retrieves aggregated streak statistics for a user.

### Context API (FinanceContext)

#### `streakData`
```typescript
{
  currentStreak: number;
  longestStreak: number;
  loading: boolean;
}
```

#### `toasts`
```typescript
Array<{ id: string; message: string }>
```

#### `removeToast(id: string): void`
Removes a toast notification from the display queue.

#### `checkStreak(): Promise<void>`
Manually trigger a streak check and update.

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only view their own streak data
- Users can only insert/update their own records
- Authenticated users only (no anonymous access)

### Policies
```sql
-- user_streaks
- "Users can view own streak data" (SELECT)
- "Users can insert own streak data" (INSERT)
- "Users can update own streak data" (UPDATE)

-- streak_events
- "Users can view own streak events" (SELECT)
- "Users can insert own streak events" (INSERT)
```

## Performance Optimizations

### Database Indexes
```sql
-- user_streaks
idx_user_streaks_user_id (user_id)
idx_user_streaks_last_activity (last_activity_date)

-- streak_events
idx_streak_events_user_id (user_id)
idx_streak_events_timestamp (timestamp)
idx_streak_events_type (event_type)
```

### Automatic Timestamp Updates
Trigger automatically updates `updated_at` on user_streaks modifications:
```sql
CREATE TRIGGER user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streaks_updated_at();
```

## Testing Guide

### 1. Initial Setup
1. Apply the database migration (see STREAK_TRACKING_MIGRATION.md)
2. Build and run the application
3. Log in as a test user

### 2. Test Scenarios

#### First Time User
- Expected: Streak initializes to 1 on first transaction
- Toast: "¡Día 1! Estás dominando tus finanzas, Chivito! 🔥"

#### Consecutive Days
- Day 1: Create transaction → Streak = 1
- Day 2: Create transaction → Streak = 2 (toast shows)
- Day 3: Create transaction → Streak = 3 (toast shows)

#### Same Day Multiple Transactions
- Create 5 transactions in same day
- Expected: Streak stays at same value, no toast

#### Streak Break
- Day 1: Create transaction → Streak = 3
- Skip Day 2
- Day 3: Create transaction → Streak = 1 (resets, no increment toast)

#### Personal Record
- Achieve 5-day streak
- Break streak and restart
- Expected: "Récord personal: 5" shows even when current is lower

### 3. Manual Testing with Modified Dates
For faster testing, you can temporarily modify dates in the database:
```sql
-- Set last_activity_date to 2 days ago
UPDATE user_streaks
SET last_activity_date = NOW() - INTERVAL '2 days'
WHERE user_id = 'YOUR_USER_ID';
```

## Analytics Queries

### Most Engaged Users
```sql
SELECT
  u.email,
  us.current_streak,
  us.longest_streak,
  us.last_activity_date
FROM user_streaks us
JOIN auth.users u ON u.id = us.user_id
ORDER BY us.current_streak DESC
LIMIT 20;
```

### Streak Break Analysis
```sql
SELECT
  event_type,
  COUNT(*) as count,
  AVG(days_since_last_activity) as avg_days_missed,
  MAX(days_since_last_activity) as max_days_missed
FROM streak_events
GROUP BY event_type;
```

### Daily Active Users with Streaks
```sql
SELECT
  DATE(timestamp AT TIME ZONE 'America/Mexico_City') as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) FILTER (WHERE event_type = 'streak_continued') as continued,
  COUNT(*) FILTER (WHERE event_type = 'streak_broken') as broken
FROM streak_events
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp AT TIME ZONE 'America/Mexico_City')
ORDER BY date DESC;
```

### Streak Distribution
```sql
SELECT
  CASE
    WHEN current_streak = 0 THEN '0 days'
    WHEN current_streak BETWEEN 1 AND 3 THEN '1-3 days'
    WHEN current_streak BETWEEN 4 AND 7 THEN '4-7 days'
    WHEN current_streak BETWEEN 8 AND 14 THEN '1-2 weeks'
    WHEN current_streak BETWEEN 15 AND 30 THEN '2-4 weeks'
    ELSE '30+ days'
  END as streak_range,
  COUNT(*) as user_count
FROM user_streaks
GROUP BY streak_range
ORDER BY MIN(current_streak);
```

## Troubleshooting

### Streak Not Updating
1. Check if user is authenticated: `supabase.auth.getUser()`
2. Verify database migration was applied
3. Check RLS policies are enabled
4. Review browser console for errors

### Toast Not Showing
1. Verify `isIncrement` is true in `calculateAndUpdateStreak` result
2. Check `toasts` state in React DevTools
3. Ensure `ToastContainer` is rendered in App

### Wrong Timezone
1. Verify `TIMEZONE` constant is 'America/Mexico_City' in streakLogic.ts
2. Check server timezone if using self-hosted Supabase
3. Test with: `new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' })`

### Animation Not Working
1. Verify CSS animation is defined in index.css
2. Check `animate-bounce-scale` class is applied
3. Ensure `isAnimating` state toggles properly

## Future Enhancements

### Potential Features
1. **Streak Milestones**: Special celebrations at 7, 30, 100 days
2. **Streak Recovery**: One-time "freeze" to prevent break
3. **Social Sharing**: Share streak achievements
4. **Streak Leaderboard**: Compare with other users
5. **Streak Reminders**: Push notifications for at-risk streaks
6. **Weekly/Monthly Stats**: Aggregate streak performance
7. **Streak Badges**: Visual achievements for milestones
8. **Custom Streak Goals**: Set personal targets

### Analytics Improvements
1. Cohort analysis by streak brackets
2. Correlation between streak length and financial goals
3. Churn prediction based on streak breaks
4. A/B testing for different celebration styles

## Maintenance

### Monitoring
- Track average streak length across users
- Monitor streak break frequency
- Alert on unusual database growth
- Review error logs for failed streak updates

### Database Cleanup
If needed, archive old streak events:
```sql
-- Archive events older than 1 year
DELETE FROM streak_events
WHERE timestamp < NOW() - INTERVAL '1 year';
```

### Performance Tuning
- Monitor query performance with EXPLAIN ANALYZE
- Add composite indexes if needed
- Consider partitioning streak_events by date for large datasets

## Support

For issues or questions:
1. Check this documentation
2. Review STREAK_TRACKING_MIGRATION.md
3. Inspect browser console for errors
4. Check Supabase logs for database errors
5. Review FinanceContext state in React DevTools
