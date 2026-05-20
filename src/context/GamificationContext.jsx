import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const GamificationContext = createContext(null);

const STORAGE_KEY = 'chivo_gamification';

const DEFAULT_STATE = {
  coins: 0,
  streak: 0,
  lastLoginDate: null,
  totalDaysActive: 0
};

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export function GamificationProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardInfo, setRewardInfo] = useState(null);

  const saveState = useCallback((newState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const checkStreak = useCallback(() => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const { lastLoginDate, streak, totalDaysActive } = state;

    if (lastLoginDate === today) {
      return;
    }

    let newStreak = streak;
    let newTotalDays = totalDaysActive;

    if (lastLoginDate === yesterday) {
      newStreak = streak + 1;
      newTotalDays = totalDaysActive + 1;
    } else if (lastLoginDate === null || lastLoginDate < yesterday) {
      newStreak = 1;
      newTotalDays = totalDaysActive + 1;
    }

    const updatedState = {
      ...state,
      streak: newStreak,
      lastLoginDate: today,
      totalDaysActive: newTotalDays
    };

    saveState(updatedState);

    if (newStreak === 3) {
      const coinsWithBonus = updatedState.coins + 25;
      saveState({ ...updatedState, coins: coinsWithBonus });
      setRewardInfo({
        type: 'streak',
        coins: 25,
        streak: newStreak,
        message: '¡3 días seguidos! 🔥'
      });
      setShowRewardModal(true);
    } else if (newStreak === 7 || (newStreak > 7 && newStreak % 7 === 0)) {
      const coinsWithBonus = updatedState.coins + 75;
      saveState({ ...updatedState, coins: coinsWithBonus });
      setRewardInfo({
        type: 'streak',
        coins: 75,
        streak: newStreak,
        message: `¡${newStreak} días seguidos! 🎉`
      });
      setShowRewardModal(true);
    }
  }, [state, saveState]);

  useEffect(() => {
    checkStreak();
  }, []);

  const addCoins = useCallback((amount) => {
    const newState = {
      ...state,
      coins: state.coins + amount
    };
    saveState(newState);
  }, [state, saveState]);

  const registerTransaction = useCallback(() => {
    let coinsToAdd = 10;
    let bonusApplied = false;

    const random = Math.random();
    if (random < 0.20) {
      coinsToAdd = 20;
      bonusApplied = true;
    }

    const newState = {
      ...state,
      coins: state.coins + coinsToAdd
    };
    saveState(newState);

    checkStreak();

    if (bonusApplied) {
      setRewardInfo({
        type: 'bonus',
        coins: coinsToAdd,
        message: '¡Bonus x2! 💰'
      });
      setShowRewardModal(true);
    }
  }, [state, saveState, checkStreak]);

  const closeRewardModal = useCallback(() => {
    setShowRewardModal(false);
    setRewardInfo(null);
  }, []);

  const value = {
    coins: state.coins,
    streak: state.streak,
    totalDaysActive: state.totalDaysActive,
    showRewardModal,
    rewardInfo,
    registerTransaction,
    closeRewardModal,
    addCoins
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}
