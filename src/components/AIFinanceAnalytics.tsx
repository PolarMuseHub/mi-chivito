import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { supabase } from '../utils/supabase';
import { trackEvent, EVENTS } from '../utils/analytics';
import { getCategoryById } from '../utils/categories';
import { Brain, Send, Sparkles, TrendingUp, PiggyBank, AlertCircle, Download } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  '¿Cuáles son mis mayores gastos este mes?',
  '¿Cómo puedo ahorrar más dinero?',
  '¿En qué categorías gasto más?',
  'Dame consejos para mejorar mis finanzas',
  '¿Cuál es mi patrón de gastos?',
];

interface AIFinanceAnalyticsProps {
  onNavigate?: (section: string) => void;
}

const AIFinanceAnalytics: React.FC<AIFinanceAnalyticsProps> = ({ onNavigate }) => {
  const { transactions } = useFinance();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    setError(null);
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('No hay sesión activa. Por favor inicia sesión.');
        setIsLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/ai-finance-analytics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            question: messageText,
            transactions: transactions,
          }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const errorText = await response.text().catch(() => '');
          console.log('Error response text:', errorText);
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        // Usamos 'reply' que es lo que manda el backend.
        // Añadimos '||' por seguridad para que nunca sea undefined.
        content: data.reply || "No se recibió respuesta del servidor.", 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error calling AI analytics:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';

      if (errorMsg.includes('API key not configured')) {
        setError('⚠️ API key no configurada. Por favor sigue las instrucciones en AI_ANALYTICS_SETUP.md');
      } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        setError('Error de autenticación. Por favor vuelve a iniciar sesión.');
      } else {
        setError(`No se pudo obtener una respuesta: ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleExportData = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleString('es-MX'),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category || '-',
      t.amount.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mi-chivito-transacciones-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    trackEvent(EVENTS.DATA_EXPORTED);
  };

  const getExpenseSuggestion = () => {
    const expenses = transactions.filter(t => t.type === 'gasto');
    if (expenses.length === 0) return null;

    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category || 'otros';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const nonEssentialCategories = ['entretenimiento', 'transporte'];
    let highestNonEssential = { category: '', amount: 0 };

    for (const category of nonEssentialCategories) {
      if (categoryTotals[category] > highestNonEssential.amount) {
        highestNonEssential = {
          category,
          amount: categoryTotals[category]
        };
      }
    }

    if (highestNonEssential.amount > 0) {
      const categoryInfo = getCategoryById(highestNonEssential.category);
      const suggestedReduction = Math.round(highestNonEssential.amount * 0.2);

      return {
        category: categoryInfo?.name || highestNonEssential.category,
        currentAmount: highestNonEssential.amount,
        suggestedReduction,
        icon: categoryInfo?.icon || '💰'
      };
    }

    return null;
  };

  const suggestion = getExpenseSuggestion();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-sage-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Análisis Financiero con IA
          </h2>
          <Sparkles className="w-6 h-6 text-sage-600" />
        </div>
        <button
          onClick={handleExportData}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar transacciones como CSV"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Descargar mis datos</span>
        </button>
      </div>

      {suggestion && (
        <div className="p-4 bg-sage-50 rounded-lg border border-sage-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{suggestion.icon}</span>
            <div>
              <h3 className="font-medium text-sage-900">Sugerencia de Ahorro</h3>
              <p className="text-sm text-sage-800 mt-1">
                Podrías reducir tus gastos en <span className="font-medium">{suggestion.category}</span> en aproximadamente{' '}
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                }).format(suggestion.suggestedReduction)}{' '}
                (20% de tus gastos actuales en esta categoría).
              </p>
            </div>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="bg-cream-100 border border-cream-300 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-800 font-medium">
              No hay transacciones para analizar
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Agrega algunas transacciones primero para obtener análisis personalizados de tu situación financiera.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.length === 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Pregúntame cualquier cosa sobre tus finanzas. Aquí hay algunas sugerencias:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-cream-100 hover:bg-cream-200 text-gray-700 text-xs rounded-lg border border-cream-300 transition-colors disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-sage-500 text-white ml-12'
                    : 'bg-white text-gray-800 mr-12 border border-gray-200'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br />'),
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-4 bg-white rounded-lg mr-12 border border-gray-200">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500">Analizando...</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-coral-50 border border-coral-200 rounded-lg">
              <p className="text-sm text-coral-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pregúntame sobre tus finanzas..."
              disabled={isLoading}
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-lg bg-sage-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sage-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>
              Analizando {transactions.length} transacciones
            </span>
            <PiggyBank className="w-4 h-4 ml-2" />
          </div>
        </>
      )}
    </div>
  );
};

export default AIFinanceAnalytics;
