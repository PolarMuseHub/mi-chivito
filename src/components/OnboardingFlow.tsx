import React, { useState } from 'react';
import OnboardingIntro from './onboarding/OnboardingIntro';
import CustomizeChivito from './onboarding/CustomizeChivito';
import ProfileQuestions from './onboarding/ProfileQuestions';
import ArchetypeResult from './onboarding/ArchetypeResult';
import GoalSetup from './onboarding/GoalSetup';
import Commitment from './onboarding/Commitment';
import type { Archetype } from '../utils/archetypeEngine';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [chivitoName, setChivitoName] = useState('tu Chivito');
  const [archetype, setArchetype] = useState<Archetype | null>(null);

  const handleIntroComplete = () => {
    setCurrentStep(2);
  };

  const handleProfileComplete = (result: Archetype) => {
    setArchetype(result);
    setCurrentStep(3);
  };

  const handleArchetypeResultContinue = () => {
    setCurrentStep(4);
  };

  const handleCustomizeComplete = (name: string) => {
    setChivitoName(name);
    setCurrentStep(5);
  };

  const handleGoalComplete = () => {
    setCurrentStep(6);
  };

  const handleCommitmentComplete = () => {
    onComplete();
  };

  return (
    <div>
      {currentStep === 1 && <OnboardingIntro onContinue={handleIntroComplete} />}
      {currentStep === 2 && (
        <ProfileQuestions chivitoName="tu Chivito" onContinue={handleProfileComplete} />
      )}
      {currentStep === 3 && archetype && (
        <ArchetypeResult archetype={archetype} onContinue={handleArchetypeResultContinue} />
      )}
      {currentStep === 4 && <CustomizeChivito onContinue={handleCustomizeComplete} />}
      {currentStep === 5 && (
        <GoalSetup chivitoName={chivitoName} onContinue={handleGoalComplete} />
      )}
      {currentStep === 6 && <Commitment onComplete={handleCommitmentComplete} />}
    </div>
  );
};

export default OnboardingFlow;
