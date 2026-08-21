import React, { useState } from 'react';
import { updateProfileAnswers } from '../../utils/onboarding';
import { supabase } from '../../utils/supabase';
import { calculateArchetype } from '../../utils/archetypeEngine';
import type { OnboardingAnswers, Archetype } from '../../utils/archetypeEngine';

interface ProfileQuestionsProps {
  chivitoName: string;
  onContinue: (archetype: Archetype) => void;
}

interface QuestionOption {
  id: string | boolean;
  emoji: string;
  text: string;
  subtitle?: string;
  archetypeKey: string;
}

interface Question {
  question: string;
  options: QuestionOption[];
  field: string;
}

const ProfileQuestions: React.FC<ProfileQuestionsProps> = ({ chivitoName, onContinue }) => {
  const [answers, setAnswers] = useState({
    income_frequency: '',
    savings_location: '',
    spending_attitude: '',
    money_leak: '',
    emergency_fund: false,
  });
  const [quizAnswers, setQuizAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const questions: Record<number, Question> = {
    1: {
      question: `¿Cada cuánto le cae lana a la bolsa a ${chivitoName}?`,
      options: [
        { id: 'daily', emoji: '📅', text: 'Diario o casi diario', subtitle: 'Comercio / Oficios', archetypeKey: 'diario' },
        { id: 'weekly', emoji: '🗓️', text: 'Cada fin de semana', subtitle: 'Raya semanal', archetypeKey: 'semanal' },
        { id: 'biweekly', emoji: '💰', text: 'Cada quincena', subtitle: 'Nómina formal / informal', archetypeKey: 'quincenal' },
        { id: 'sporadic', emoji: '🎲', text: 'Cuando cae, cae', subtitle: 'Freelance / Esporádico', archetypeKey: 'esporadico' },
      ],
      field: 'income_frequency',
    },
    2: {
      question: 'Para que yo pueda llevar bien la cuenta… ¿dónde vas guardando tu lana?',
      options: [
        { id: 'cash_home', emoji: '🏠', text: 'En un bote / alcancía / bajo el colchón', subtitle: 'Efectivo', archetypeKey: 'efectivo' },
        { id: 'bank', emoji: '💳', text: 'En una cuenta del banco / tarjeta', subtitle: 'Digital', archetypeKey: 'banco' },
        { id: 'trusted_person', emoji: '🤝', text: 'Se lo doy a alguien de confianza', subtitle: 'Tanda / Esposa', archetypeKey: 'confianza' },
        { id: 'wallet', emoji: '⚠️', text: 'Ahí en la cartera', subtitle: 'Peligroso', archetypeKey: 'cartera' },
      ],
      field: 'savings_location',
    },
    3: {
      question: 'La neta… si te sobran $200 pesos el viernes, ¿qué haces?',
      options: [
        { id: 'saver', emoji: '🐿️', text: 'Los guardo "por si las moscas"', archetypeKey: 'guarda' },
        { id: 'foodie', emoji: '🌮', text: 'Me compro algo rico para comer o beber', archetypeKey: 'come' },
        { id: 'responsible_payer', emoji: '💸', text: 'Pago lo que debo antes de que se me olvide', archetypeKey: 'deuda' },
        { id: 'impulsive', emoji: '😎', text: 'Me compro algo que me gusta, que para eso trabajo', archetypeKey: 'gusta' },
      ],
      field: 'spending_attitude',
    },
    4: {
      question: 'La neta… ¿en qué crees que se te va la lana sin querer?',
      options: [
        { id: 'food_drinks', emoji: '🌮', text: 'Antojitos / Cheve / Cigarros', archetypeKey: 'antojitos' },
        { id: 'transport', emoji: '🚗', text: 'Transportes', subtitle: 'Uber / Taxi', archetypeKey: 'transporte' },
        { id: 'phone', emoji: '📱', text: 'Datos del cel / Recargas', archetypeKey: 'datos' },
        { id: 'family_loans', emoji: '👨‍👩‍👧', text: 'Prestada a la familia', archetypeKey: 'familia' },
      ],
      field: 'money_leak',
    },
    5: {
      question: 'Toca madera: si mañana se descompone algo de la casa (lavadora, compu, carro), ¿tienes $1,000 para arreglarlo de volada?',
      options: [
        { id: true, emoji: '✅', text: 'Sí, ahí tengo un guardadito', archetypeKey: 'tiene' },
        { id: false, emoji: '🤔', text: 'No, pero consigo quien me preste en corto', archetypeKey: 'consigue' },
        { id: false, emoji: '😰', text: 'Híjole, tendría que empeñar algo o vender', archetypeKey: 'empenia' },
        { id: false, emoji: '❌', text: 'Ni de chiste', archetypeKey: 'nada' },
      ],
      field: 'emergency_fund',
    },
  };

  const saveArchetypeData = async (quiz: OnboardingAnswers, archetypeId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: insertError } = await supabase.from('onboarding_responses').insert({
        user_id: user.id,
        q1_income_frequency: quiz.q1,
        q2_savings_method: quiz.q2,
        q3_surplus_behavior: quiz.q3,
        q4_leak_category: quiz.q4,
        q5_emergency_fund: quiz.q5,
        archetype_id: archetypeId,
      });

      if (insertError) {
        console.error('Error inserting onboarding_responses:', insertError);
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          archetype_id: archetypeId,
          archetype_assigned_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating user_profiles archetype:', updateError);
      }
    } catch (err) {
      console.error('Error in saveArchetypeData:', err);
    }
  };

  const handleAnswer = async (value: string | boolean, archetypeKey: string) => {
    if (isSubmitting) return;

    setSelectedKey(archetypeKey);
    const field = questions[currentQuestion].field as keyof typeof answers;
    const newAnswers = { ...answers, [field]: value };
    setAnswers(newAnswers);

    const qKey = `q${currentQuestion}` as keyof OnboardingAnswers;
    const newQuizAnswers = { ...quizAnswers, [qKey]: archetypeKey };
    setQuizAnswers(newQuizAnswers);

    setTimeout(async () => {
      setSelectedKey(null);
      if (currentQuestion < 5) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setIsSubmitting(true);

        const completeQuizAnswers = newQuizAnswers as OnboardingAnswers;
        const result = calculateArchetype(completeQuizAnswers);

        await updateProfileAnswers(newAnswers);
        await saveArchetypeData(completeQuizAnswers, result.archetype.id);

        setIsSubmitting(false);
        onContinue(result.archetype);
      }
    }, 180);
  };

  const handleBack = () => {
    if (currentQuestion > 1) {
      setSelectedKey(null);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const defaultAnswers: OnboardingAnswers = {
      q1: 'quincenal',
      q2: 'banco',
      q3: 'guarda',
      q4: 'antojitos',
      q5: 'tiene',
      ...quizAnswers,
    };
    const result = calculateArchetype(defaultAnswers);
    await saveArchetypeData(defaultAnswers, result.archetype.id);

    setIsSubmitting(false);
    onContinue(result.archetype);
  };

  const currentQ = questions[currentQuestion];
  const progressPercent = Math.round((currentQuestion / 5) * 100);

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-[28px] border border-[#F1E4D7] p-6 sm:p-7 shadow-sm flex flex-col">
        {/* Quiz Toprow / Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className={`w-8 h-8 rounded-full bg-white border border-[#F1E4D7] flex items-center justify-center text-[#241B14] hover:bg-[#FBF6F0] transition-colors cursor-pointer ${
                currentQuestion === 1 ? 'invisible pointer-events-none' : ''
              }`}
              aria-label="Pregunta anterior"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-xs font-bold text-[#B7AB9C] hover:text-[#241B14] transition-colors cursor-pointer"
            >
              Saltar por ahora
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8A7F72]">
              Pregunta {currentQuestion} de 5
            </span>
            <span className="text-xs font-extrabold text-orange-dark">
              {progressPercent}%
            </span>
          </div>

          <div className="h-[7px] rounded-full bg-[#F1E4D7] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange to-orange-dark transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Title */}
        <h2 className="font-['Fraunces',serif] font-bold text-[22px] sm:text-[23px] text-[#241B14] leading-[1.28] my-4">
          {currentQ.question}
        </h2>

        {/* Options List */}
        <div className="space-y-2.5 mb-2">
          {currentQ.options.map((option) => {
            const isSelected = selectedKey === option.archetypeKey;
            return (
              <button
                key={option.archetypeKey}
                onClick={() => handleAnswer(option.id, option.archetypeKey)}
                disabled={isSubmitting}
                className={`w-full flex items-center gap-3.5 bg-white border-[1.5px] rounded-[16px] p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-orange bg-[#FFF1E4]'
                    : 'border-[#F1E4D7] hover:border-orange/50 hover:bg-[#FFF8F2]'
                }`}
              >
                <div className="w-[42px] h-[42px] rounded-[12px] bg-[#FFF8F2] flex items-center justify-center flex-shrink-0 text-xl select-none">
                  {option.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-extrabold text-[#241B14] leading-snug">
                    {option.text}
                  </div>
                  {option.subtitle && (
                    <div className="text-[11.5px] font-semibold text-[#8A7F72] mt-0.5">
                      {option.subtitle}
                    </div>
                  )}
                </div>

                <div
                  className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-orange border-orange text-white'
                      : 'border-[#D8CBB9] bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileQuestions;
