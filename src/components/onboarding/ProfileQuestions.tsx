import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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
    emergency_fund: false
  });
  const [quizAnswers, setQuizAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions: Record<number, Question> = {
    1: {
      question: `¿Cada cuánto le cae lana a la bolsa a ${chivitoName}?`,
      options: [
        { id: 'daily', emoji: '📅', text: 'Diario o casi diario', subtitle: 'Comercio/Oficios', archetypeKey: 'diario' },
        { id: 'weekly', emoji: '📆', text: 'Cada fin de semana', subtitle: 'Raya semanal', archetypeKey: 'semanal' },
        { id: 'biweekly', emoji: '💰', text: 'Cada quincena', subtitle: 'Nómina formal/informal', archetypeKey: 'quincenal' },
        { id: 'sporadic', emoji: '🎲', text: 'Cuando cae, cae', subtitle: 'Freelance/Esporádico', archetypeKey: 'esporadico' }
      ],
      field: 'income_frequency'
    },
    2: {
      question: 'Para que yo pueda llevar bien la cuenta... ¿Dónde vas a ir guardando tu lana?',
      options: [
        { id: 'cash_home', emoji: '🏠', text: 'En un bote / alcancía / bajo el colchón', subtitle: 'Efectivo', archetypeKey: 'efectivo' },
        { id: 'bank', emoji: '💳', text: 'En una cuenta del banco / tarjeta', subtitle: 'Digital', archetypeKey: 'banco' },
        { id: 'trusted_person', emoji: '🤝', text: 'Se lo doy a alguien de confianza', subtitle: 'Tanda / Esposa', archetypeKey: 'confianza' },
        { id: 'wallet', emoji: '⚠️', text: 'Ahí en la cartera', subtitle: 'Peligroso', archetypeKey: 'cartera' }
      ],
      field: 'savings_location'
    },
    3: {
      question: 'La neta... si te sobran $200 pesos el viernes, ¿qué haces?',
      options: [
        { id: 'saver', emoji: '🐿️', text: 'Los guardo "por si las moscas"', archetypeKey: 'guarda' },
        { id: 'foodie', emoji: '🌮', text: 'Me compro algo rico para comer o beber', archetypeKey: 'come' },
        { id: 'responsible_payer', emoji: '💸', text: 'Pago lo que debo antes de que se me olvide', archetypeKey: 'deuda' },
        { id: 'impulsive', emoji: '😎', text: 'Me compro algo que me gusta, que para eso trabajo', archetypeKey: 'gusta' }
      ],
      field: 'spending_attitude'
    },
    4: {
      question: 'La neta... ¿En qué crees que se te va la lana sin querer?',
      options: [
        { id: 'food_drinks', emoji: '🌮', text: 'Antojitos / Cheve / Cigarros', archetypeKey: 'antojitos' },
        { id: 'transport', emoji: '🚗', text: 'Transportes', subtitle: 'Uber / Taxi', archetypeKey: 'transporte' },
        { id: 'phone', emoji: '📱', text: 'Datos del cel / Recargas', archetypeKey: 'datos' },
        { id: 'family_loans', emoji: '👨‍👩‍👧‍👦', text: 'Prestada a la familia', archetypeKey: 'familia' }
      ],
      field: 'money_leak'
    },
    5: {
      question: 'Toca madera: Si mañana se te descompone algo de la casa (la lavadora, la compu, el carro), ¿tienes $1,000 varos para arreglarlo de volada?',
      options: [
        { id: true, emoji: '✅', text: 'Sí, ahí tengo un guardadito', archetypeKey: 'tiene' },
        { id: false, emoji: '🤔', text: 'No, pero consigo quien me preste en corto', archetypeKey: 'consigue' },
        { id: false, emoji: '😰', text: 'Híjole, tendría que empeñar algo o vender', archetypeKey: 'empenia' },
        { id: false, emoji: '❌', text: 'Ni de chiste', archetypeKey: 'nada' }
      ],
      field: 'emergency_fund'
    }
  };

  const saveArchetypeData = async (quiz: OnboardingAnswers, archetypeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: insertError } = await supabase
        .from('onboarding_responses')
        .insert({
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
    const field = questions[currentQuestion].field as keyof typeof answers;
    const newAnswers = { ...answers, [field]: value };
    setAnswers(newAnswers);

    const qKey = `q${currentQuestion}` as keyof OnboardingAnswers;
    const newQuizAnswers = { ...quizAnswers, [qKey]: archetypeKey };
    setQuizAnswers(newQuizAnswers);

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
  };

  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-sage-500 font-medium">Pregunta {currentQuestion} de 5</span>
            <span className="text-sm font-medium text-coral-500">{Math.round((currentQuestion / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-cream-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-coral-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentQuestion / 5) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-sage-900 mb-8 text-center leading-tight">
          {currentQ.question}
        </h2>

        <div className="grid gap-4 mb-6">
          {currentQ.options.map((option) => (
            <button
              key={option.archetypeKey}
              onClick={() => handleAnswer(option.id, option.archetypeKey)}
              disabled={isSubmitting}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left border border-cream-200 hover:border-coral-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl flex-shrink-0">{option.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-sage-900 text-base leading-snug">{option.text}</p>
                  {option.subtitle && (
                    <p className="text-sm text-sage-500 mt-1">{option.subtitle}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {currentQuestion > 1 && (
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-coral-500 hover:text-coral-600 font-medium transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
            Regresar
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileQuestions;
