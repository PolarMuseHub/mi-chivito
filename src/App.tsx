import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import BalanceDisplay from './components/BalanceDisplay';
import AddTransactionForm from './components/AddTransactionForm';
import AIFinanceAnalytics from './components/AIFinanceAnalytics';
import TransactionList from './components/TransactionList';
import FinancialGoalForm from './components/FinancialGoalForm';
import AuthWrapper from './components/AuthWrapper';
import OnboardingFlow from './components/OnboardingFlow';
import LoadingSpinner from './components/LoadingSpinner';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { trackEvent, EVENTS } from './utils/analytics';
import { StreakCounter } from './components/StreakCounter';
import { GoalDisplay } from './components/GoalDisplay';
import { ChivitoDisplay } from './components/ChivitoDisplay';
import { ToastContainer } from './components/Toast';
import { getUserProfile, createUserProfile } from './utils/onboarding';

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('balance');
  const [goalRefreshTrigger, setGoalRefreshTrigger] = useState(0);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigate = useNavigate();
  const { streakData, toasts, removeToast, checkStreak } = useFinance();

  useEffect(() => {
    trackEvent(EVENTS.APP_LOADED);
    checkStreak();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    setCheckingOnboarding(true);
    const profile = await getUserProfile();

    if (!profile) {
      const created = await createUserProfile();
      if (created) {
        setOnboardingCompleted(false);
      }
    } else {
      setOnboardingCompleted(profile.onboarding_completed);
    }

    setCheckingOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    setGoalRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (activeSection === 'balance') {
      setGoalRefreshTrigger(prev => prev + 1);
    }
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'balance':
        return <BalanceDisplay />;
      case 'nuevo':
        return <AddTransactionForm />;
      case 'metas':
        return <FinancialGoalForm onSuccess={() => setActiveSection('balance')} />;
      case 'analytics':
        return <AIFinanceAnalytics onNavigate={setActiveSection} />;
      case 'info':
        return <TransactionList />;
      default:
        return <BalanceDisplay />;
    }
  };

  if (checkingOnboarding) {
    return <LoadingSpinner />;
  }

  if (onboardingCompleted === false) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-cream-200">
      <Header currentSection={activeSection} onSectionChange={setActiveSection} />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <ChivitoDisplay />
          {!streakData.loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StreakCounter
                streak={streakData.currentStreak}
                longestStreak={streakData.longestStreak}
              />
              <GoalDisplay
                onNavigateToGoals={() => setActiveSection('metas')}
                refreshTrigger={goalRefreshTrigger}
              />
            </div>
          )}
          {renderSection()}
        </div>
      </main>

      <footer className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 text-center text-sm text-gray-500">
        <p className="mb-2">Mi Chivito © {new Date().getFullYear()} - Finanzas personales simplificadas</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/terms-and-conditions')}
            className="text-sage-600 hover:underline font-medium"
          >
            Términos y Condiciones
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => navigate('/privacy-policy')}
            className="text-sage-600 hover:underline font-medium"
          >
            Aviso de Privacidad
          </button>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

function App() {
  return (
    <AuthWrapper>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthWrapper>
  );
}

export default App;