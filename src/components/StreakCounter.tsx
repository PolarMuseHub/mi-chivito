import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  longestStreak?: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak, longestStreak }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);

  useEffect(() => {
    if (streak > prevStreak && streak > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak]);

  const isActive = streak > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-3 transition-transform ${
              isAnimating ? 'animate-bounce-scale' : ''
            }`}
          >
            {isActive ? (
              <Flame
                size={32}
                className="text-orange-500"
                fill="#FF6B35"
                strokeWidth={1.5}
              />
            ) : (
              <Flame
                size={32}
                className="text-gray-300"
                strokeWidth={1.5}
              />
            )}
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    isActive ? 'text-orange-500' : 'text-gray-300'
                  }`}
                >
                  {streak}
                </span>
                <span className="text-base text-gray-600">
                  {streak === 1 ? 'día seguido' : 'días seguidos'}
                </span>
              </div>
              {isActive && (
                <p className="text-sm text-gray-500 mt-1">
                  ¡Sigue así, Chivito! 🎉
                </p>
              )}
              {!isActive && (
                <p className="text-sm text-gray-400 mt-1">
                  Comienza tu racha hoy
                </p>
              )}
            </div>
          </div>
        </div>

        {longestStreak !== undefined && longestStreak > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Récord personal</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <Flame size={16} className="text-amber-500" fill="#F59E0B" />
              <span className="text-xl font-bold text-amber-600">
                {longestStreak}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
