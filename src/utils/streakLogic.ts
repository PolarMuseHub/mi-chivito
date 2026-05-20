import { supabase } from './supabase';

const TIMEZONE = 'America/Mexico_City';

export interface StreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_broken_at: string | null;
  streak_broken_count: number;
  created_at: string;
  updated_at: string;
}

export interface StreakUpdateResult {
  streak: number;
  isIncrement: boolean;
  wasBroken: boolean;
  isNewRecord: boolean;
}

const getDateInTimezone = (date: Date = new Date()): Date => {
  const dateString = date.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(dateString);
};

const getStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDaysDifference = (date1: Date, date2: Date): number => {
  const day1 = getStartOfDay(date1);
  const day2 = getStartOfDay(date2);
  const diffTime = day1.getTime() - day2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getStreakData = async (userId: string): Promise<StreakData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching streak data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getStreakData:', error);
    return null;
  }
};

export const initializeStreak = async (userId: string): Promise<StreakData | null> => {
  try {
    const now = getDateInTimezone();

    const { data, error } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: now.toISOString(),
        streak_broken_at: null,
        streak_broken_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error initializing streak:', error);
      return null;
    }

    await supabase.from('streak_events').insert({
      user_id: userId,
      event_type: 'streak_started',
      streak_value: 1,
      days_since_last_activity: 0
    });

    return data;
  } catch (error) {
    console.error('Error in initializeStreak:', error);
    return null;
  }
};

export const calculateAndUpdateStreak = async (userId: string): Promise<StreakUpdateResult> => {
  try {
    let streakData = await getStreakData(userId);

    if (!streakData) {
      streakData = await initializeStreak(userId);
      return {
        streak: 1,
        isIncrement: true,
        wasBroken: false,
        isNewRecord: true
      };
    }

    const now = getDateInTimezone();
    const today = getStartOfDay(now);

    if (!streakData.last_activity_date) {
      const { data: updated } = await supabase
        .from('user_streaks')
        .update({
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: now.toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      await supabase.from('streak_events').insert({
        user_id: userId,
        event_type: 'streak_started',
        streak_value: 1,
        days_since_last_activity: 0
      });

      return {
        streak: 1,
        isIncrement: true,
        wasBroken: false,
        isNewRecord: true
      };
    }

    const lastActivity = new Date(streakData.last_activity_date);
    const lastActivityDay = getStartOfDay(getDateInTimezone(lastActivity));
    const daysDiff = getDaysDifference(today, lastActivityDay);

    if (daysDiff === 0) {
      return {
        streak: streakData.current_streak,
        isIncrement: false,
        wasBroken: false,
        isNewRecord: false
      };
    } else if (daysDiff === 1) {
      const newStreak = streakData.current_streak + 1;
      const newLongest = Math.max(newStreak, streakData.longest_streak);

      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: now.toISOString()
        })
        .eq('user_id', userId);

      await supabase.from('streak_events').insert({
        user_id: userId,
        event_type: 'streak_continued',
        streak_value: newStreak,
        days_since_last_activity: 1
      });

      return {
        streak: newStreak,
        isIncrement: true,
        wasBroken: false,
        isNewRecord: newStreak > streakData.longest_streak
      };
    } else {
      const newStreak = 1;
      const newBrokenCount = streakData.streak_broken_count + 1;

      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: streakData.longest_streak,
          last_activity_date: now.toISOString(),
          streak_broken_at: now.toISOString(),
          streak_broken_count: newBrokenCount
        })
        .eq('user_id', userId);

      await supabase.from('streak_events').insert({
        user_id: userId,
        event_type: 'streak_broken',
        streak_value: newStreak,
        days_since_last_activity: daysDiff
      });

      return {
        streak: newStreak,
        isIncrement: false,
        wasBroken: true,
        isNewRecord: false
      };
    }
  } catch (error) {
    console.error('Error in calculateAndUpdateStreak:', error);
    return {
      streak: 0,
      isIncrement: false,
      wasBroken: false,
      isNewRecord: false
    };
  }
};

export const getStreakStats = async (userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  totalBreaks: number;
} | null> => {
  try {
    const data = await getStreakData(userId);

    if (!data) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalBreaks: 0
      };
    }

    return {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      totalBreaks: data.streak_broken_count
    };
  } catch (error) {
    console.error('Error in getStreakStats:', error);
    return null;
  }
};
