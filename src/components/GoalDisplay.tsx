import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { getUserGoals, formatCurrency, GOAL_TYPES } from '../utils/goals';
import { FinancialGoal } from '../types';

interface GoalDisplayProps {
  onNavigateToGoals: () => void;
  refreshTrigger?: number;
}

export const GoalDisplay: React.FC<GoalDisplayProps> = ({ onNavigateToGoals, refreshTrigger }) => {
  const [activeGoal, setActiveGoal] = useState<FinancialGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveGoal();
  }, [refreshTrigger]);

  const fetchActiveGoal = async () => {
    setIsLoading(true);
    const goals = await getUserGoals(true);
    if (goals.length > 0) {
      setActiveGoal(goals[0]);
    }
    setIsLoading(false);
  };

  const getGoalIcon = (goalType: string) => {
    const goalTypeObj = GOAL_TYPES.find(type => type.value === goalType);
    return goalTypeObj?.icon || '🎯';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-dark/20 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!activeGoal) {
    return (
      <button
        onClick={onNavigateToGoals}
        className="bg-white rounded-2xl shadow-sm p-4 border border-orange-dark/20 hover:border-orange-dark/50 hover:shadow-md transition-all w-full text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center group-hover:bg-orange-dark/10 transition-colors">
            <Target size={24} className="text-orange-dark" />
          </div>
          <div>
            <p className="text-base font-bold text-ink group-hover:text-orange-dark transition-colors">
              Crea tu meta
            </p>
            <p className="text-sm text-body">
              Dale a tu Chivito algo que proteger
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl flex-shrink-0">
            {getGoalIcon(activeGoal.goal_type)}
          </div>
          <div>
            <h3 className="text-base font-bold font-['Fraunces'] text-ink">
              {activeGoal.goal_name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-ink">
                {formatCurrency(activeGoal.target_amount)}
              </span>
            </div>
            <p className="text-xs text-body mt-0.5">
              Meta creada el {formatDate(activeGoal.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
