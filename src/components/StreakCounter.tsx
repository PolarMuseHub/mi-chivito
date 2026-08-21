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
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-4 transition-transform ${
              isAnimating ? 'animate-bounce-scale' : ''
            }`}
          >
            {isActive ? (
              <Flame
                size={32}
                className="text-orange-dark"
                fill="currentColor"
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
                  className={`text-2xl font-bold font-['Fraunces'] ${
                    isActive ? 'text-orange-dark' : 'text-gray-300'
                  }`}
                >
                  {streak}
                </span>
                <span className="text-sm text-body font-semibold">
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
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-body font-semibold">Récord</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <Flame size={14} className="text-amber-500" fill="#F59E0B" />
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
