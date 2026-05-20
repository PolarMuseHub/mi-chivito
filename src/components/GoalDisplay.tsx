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
      <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!activeGoal) {
    return (
      <button
        onClick={onNavigateToGoals}
        className="bg-white rounded-lg shadow-sm p-6 border border-cream-200 hover:border-coral-500 hover:shadow-md transition-all w-full text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center group-hover:bg-cream-200 transition-colors">
            <Target size={24} className="text-sage-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-600 group-hover:text-sage-700 transition-colors">
              Crea tu meta
            </p>
            <p className="text-sm text-sage-500">
              Dale algo que proteger a tu Chivito
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-cream-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">
            {getGoalIcon(activeGoal.goal_type)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-sage-900">
              {activeGoal.goal_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-sage-600">
                {formatCurrency(activeGoal.target_amount)}
              </span>
            </div>
            <p className="text-sm text-sage-500 mt-1">
              Creada el {formatDate(activeGoal.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
