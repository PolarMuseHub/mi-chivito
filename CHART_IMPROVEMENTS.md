# Chart Improvements Documentation

## Overview
This document describes the improvements made to the transaction charts and frequency options.

## New Frequency Options

### For Expenses and Income
Two new frequency options have been added to the expense and income tracking:

1. **Catorcenal** (Biweekly - every 14 days)
   - Perfect for tracking payments that occur every two weeks
   - Common for biweekly paychecks or payments

2. **Quincenal** (Bimonthly - every 15 days)
   - Ideal for tracking mid-month transactions
   - Common in Mexican financial practices

These new options appear in:
- The expense frequency dropdown when creating a transaction
- The recurring transaction interval selector
- Transaction display badges

### Updated Frequency List
The complete frequency options are now:
- Diario (Daily)
- Semanal (Weekly)
- **Catorcenal (Biweekly)** - NEW
- **Quincenal (Bimonthly)** - NEW
- Mensual (Monthly)
- Bimestral (Bimonthly - every 2 months)
- Semestral (Semiannual)
- Anual (Annual)
- Irregular
- Variable

## Chart Rendering Improvements

### Fixed Issues
1. **Weekly View Aggregation**: The weekly view now correctly aggregates transactions over 7-day periods instead of using incorrect date ranges
2. **Data Persistence**: Charts now properly refresh when switching between views (Daily, Weekly, Monthly, Yearly, All)
3. **Date Range Calculations**: Each time range now calculates proper start and end dates:
   - **Daily**: Single day (00:00:00 to 23:59:59)
   - **Weekly**: Full 7-day periods
   - **Monthly**: Complete month boundaries
   - **Yearly**: 12 months within selected year

### Technical Improvements
1. Added a `key` prop to the chart component that changes when:
   - Time range selection changes
   - Selected transaction types change
   - This forces React to re-render the chart with fresh data

2. Improved date range calculation logic:
   ```typescript
   // Weekly view now correctly spans 7 days
   if (timeRange === 'weekly') {
     nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6, 23, 59, 59);
   }
   ```

3. Added chart animation configuration for smoother transitions:
   ```typescript
   animation: {
     duration: 300
   }
   ```

4. Set `beginAtZero: true` for the Y-axis to ensure charts always start from zero

## Recurring Transaction Intervals

### Updated Intervals
The recurring transaction feature now supports:
- **weekly**: Every 7 days
- **biweekly**: Every 14 days (Catorcenal)
- **bimonthly**: Every 15 days (Quincenal)
- **monthly**: Same day each month

### Implementation
The `calculateNextOccurrence` function in `src/utils/recurringTransactions.ts` now handles all four intervals:

```typescript
if (interval === 'weekly') {
  nextDate.setDate(nextDate.getDate() + 7);
} else if (interval === 'biweekly') {
  nextDate.setDate(nextDate.getDate() + 14);
} else if (interval === 'bimonthly') {
  nextDate.setDate(nextDate.getDate() + 15);
} else if (interval === 'monthly') {
  nextDate.setMonth(nextDate.getMonth() + 1);
}
```

## User Experience Improvements

### Visual Indicators
- Recurring transactions display frequency badges: "Semanal", "Catorcenal", "Quincenal", or "Mensual"
- Auto-generated transactions show an "Auto" badge
- Badges use distinct colors for easy identification

### Chart Responsiveness
- Charts now respond immediately to filter changes
- Smooth 300ms animation when data updates
- Consistent behavior across all time range selections

## Database Migration

To support the new frequency intervals in Supabase, update the `recurrence_interval` column constraint:

```sql
ALTER TABLE transactions ADD COLUMN recurrence_interval text
  CHECK (recurrence_interval IN ('weekly', 'biweekly', 'bimonthly', 'monthly'));
```

See `RECURRING_TRANSACTIONS_MIGRATION.md` for complete database setup instructions.

## Testing Recommendations

1. **Create test transactions** with different frequencies:
   - Weekly income
   - Catorcenal (biweekly) expenses
   - Quincenal (bimonthly) recurring payments
   - Monthly bills

2. **Test chart views**:
   - Switch between Daily, Weekly, Monthly views
   - Verify data appears correctly in each view
   - Check that aggregations make sense for each period

3. **Test recurring transactions**:
   - Create recurring transactions with each interval
   - Wait for automatic generation (checks every 60 seconds)
   - Verify new transactions appear with "Auto" badge

## Future Enhancements

Potential improvements for consideration:
- Custom recurrence intervals (e.g., every X days)
- End date for recurring transactions
- Skip/pause functionality for recurring transactions
- Bulk edit recurring transaction series
