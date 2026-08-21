import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { supabase } from '../utils/supabase';
import { trackEvent, EVENTS } from '../utils/analytics';
import { getCategoryById } from '../utils/categories';
import {
  Send,
  AlertCircle,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Plus,
} from 'lucide-react';

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

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netSavings = totalIncome - totalExpense;
  const totalFlow = totalIncome + totalExpense;
  const incomePercent = totalFlow > 0 ? Math.round((totalIncome / totalFlow) * 100) : 50;
  const expensePercent = 100 - incomePercent;
  const savingsPercent = totalIncome > 0 ? Math.round((Math.max(0, netSavings) / totalIncome) * 100) : 0;

  const currentMonthLabel = useMemo(() => {
    const formatted = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'gasto');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    if (total === 0) return [];

    const map = new Map<string, number>();
    expenses.forEach((t) => {
      const catName = getCategoryById(t.category || '')?.name || t.category || 'Otros';
      map.set(catName, (map.get(catName) || 0) + t.amount);
    });

    const colors = ['#E2523D', '#C98A1E', '#7C5CD6', '#FF7A2E', '#3B6FE0', '#D6467E'];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amt], idx) => ({
        name,
        amt,
        pct: Math.round((amt / total) * 100),
        color: colors[idx % colors.length],
      }));
  }, [transactions]);

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    setError(null);
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('No hay sesión activa. Por favor inicia sesión.');
        setIsLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-finance-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question: messageText,
          transactions: transactions,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          const errorText = await response.text().catch(() => '');
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'No se recibió respuesta del servidor.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleExportData = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleString('es-MX'),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category || '-',
      t.amount.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
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
    const expenses = transactions.filter((t) => t.type === 'gasto');
    if (expenses.length === 0) return null;

    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category || 'otros';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const nonEssentialCategories = ['entretenimiento', 'transporte', 'comida', 'restaurantes'];
    let highestNonEssential = { category: '', amount: 0 };

    for (const category of nonEssentialCategories) {
      if (categoryTotals[category] && categoryTotals[category] > highestNonEssential.amount) {
        highestNonEssential = {
          category,
          amount: categoryTotals[category],
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
        icon: categoryInfo?.icon || '💰',
      };
    }

    return null;
  };

  const suggestion = getExpenseSuggestion();

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3">
          <div className="w-[38px] h-[38px] rounded-[12px] bg-[#F0ECFB] text-[#7C5CD6] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.5 3a3.5 3.5 0 00-3.4 4.3A3 3 0 004.5 12a3 3 0 001.6 4.7A3.5 3.5 0 009.5 21M14.5 3a3.5 3.5 0 013.4 4.3A3 3 0 0119.5 12a3 3 0 01-1.6 4.7 3.5 3.5 0 01-3.4 3.3M9.5 3v18M14.5 3v18" />
            </svg>
          </div>
          <div>
            <h2 className="font-['Fraunces',serif] font-bold text-[20px] text-[#241B14] leading-tight">
              Análisis financiero con IA
            </h2>
          </div>
        </div>

        <button
          onClick={handleExportData}
          disabled={transactions.length === 0}
          className={`flex-shrink-0 flex items-center gap-1.5 border-[1.5px] border-[#F1E4D7] rounded-xl px-3 py-2 text-[11.5px] font-bold transition-all shadow-sm ${
            transactions.length === 0
              ? 'bg-white text-[#C4B9AA] opacity-75 cursor-not-allowed'
              : 'bg-white text-[#241B14] hover:bg-[#FBF6F0] cursor-pointer'
          }`}
          title="Descargar transacciones como CSV"
        >
          <svg className="w-3.5 h-3.5 text-[#7C5CD6]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2z" />
          </svg>
          <Download className="w-3.5 h-3.5 text-[#241B14]" />
          <span>Descargar</span>
        </button>
      </div>

      {transactions.length === 0 ? (
        /* Estado Vacío (09_analisis_vacio.html) */
        <div className="bg-white rounded-[18px] p-6 text-center border border-[#F1E4D7] shadow-sm">
          <div className="w-[52px] h-[52px] rounded-full bg-[#FBF2E1] text-[#C98A1E] flex items-center justify-center mx-auto mb-3.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-[15px] font-extrabold text-[#241B14] mb-2">
            No hay transacciones para analizar
          </h3>
          <p className="text-[12.5px] text-[#8A7F72] font-medium leading-relaxed max-w-[260px] mx-auto mb-5">
            Agrega algunas transacciones primero para obtener análisis personalizados de tu situación financiera.
          </p>
          <button
            onClick={() => onNavigate?.('nuevo')}
            className="inline-flex items-center gap-2 rounded-xl py-2.5 px-4 bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-extrabold text-[12.5px] shadow-md shadow-orange/30 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agregar mi primer movimiento</span>
          </button>
        </div>
      ) : (
        /* Estado con datos (10_analisis_con_datos.html) */
        <>
          {/* Card Resumen Ingresos vs Gastos */}
          <div className="bg-white rounded-[18px] p-5 border border-[#F1E4D7] shadow-sm">
            <div className="flex justify-between items-end mb-3.5">
              <div>
                <div className="text-[11px] font-bold text-[#8A7F72] tracking-wider uppercase">INGRESOS</div>
                <div className="font-['Fraunces',serif] text-[19px] font-bold text-[#2E7D5B] mt-0.5">
                  ${totalIncome.toLocaleString('es-MX')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-[#8A7F72] tracking-wider uppercase">GASTOS</div>
                <div className="font-['Fraunces',serif] text-[19px] font-bold text-[#E2523D] mt-0.5">
                  ${totalExpense.toLocaleString('es-MX')}
                </div>
              </div>
            </div>

            <div className="h-2.5 rounded-full bg-[#FDECE9] overflow-hidden flex">
              <div
                className="bg-[#2E7D5B] h-full transition-all duration-500"
                style={{ width: `${incomePercent}%` }}
              />
              <div
                className="bg-[#E2523D] h-full transition-all duration-500"
                style={{ width: `${expensePercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-[#8A7F72] font-semibold">
              <span>{currentMonthLabel}</span>
              <span>
                {netSavings >= 0
                  ? `Ahorraste $${netSavings.toLocaleString('es-MX')} (${savingsPercent}%)`
                  : `Déficit de $${Math.abs(netSavings).toLocaleString('es-MX')}`}
              </span>
            </div>
          </div>

          {/* AI Insights Cards */}
          {categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-[18px] p-4 border border-[#F1E4D7] shadow-sm flex gap-3">
              <div className="w-9 h-9 rounded-[11px] bg-[#FDECE9] text-[#E2523D] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-[#241B14] mb-1">
                  Mayor concentración en {categoryBreakdown[0].name}
                </h4>
                <p className="text-[12px] text-[#8A7F72] font-medium leading-relaxed">
                  Representa el {categoryBreakdown[0].pct}% de tus gastos totales con un monto de ${categoryBreakdown[0].amt.toLocaleString('es-MX')}.
                </p>
                <span className="inline-block text-[9.5px] font-extrabold text-[#7C5CD6] bg-[#F0ECFB] px-2 py-0.5 rounded-[8px] mt-2 tracking-wide">
                  GENERADO CON IA
                </span>
              </div>
            </div>
          )}

          {netSavings >= 0 && (
            <div className="bg-white rounded-[18px] p-4 border border-[#F1E4D7] shadow-sm flex gap-3">
              <div className="w-9 h-9 rounded-[11px] bg-[#E8F3EC] text-[#2E7D5B] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-[#241B14] mb-1">
                  Buen ritmo de ahorro este período
                </h4>
                <p className="text-[12px] text-[#8A7F72] font-medium leading-relaxed">
                  Tus ingresos superan a tus gastos por ${netSavings.toLocaleString('es-MX')}, lo que protege la salud financiera de tu Chivito.
                </p>
                <span className="inline-block text-[9.5px] font-extrabold text-[#7C5CD6] bg-[#F0ECFB] px-2 py-0.5 rounded-[8px] mt-2 tracking-wide">
                  GENERADO CON IA
                </span>
              </div>
            </div>
          )}

          {suggestion && (
            <div className="bg-white rounded-[18px] p-4 border border-[#F1E4D7] shadow-sm flex gap-3">
              <div className="w-9 h-9 rounded-[11px] bg-[#F0ECFB] text-[#7C5CD6] flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-[#241B14] mb-1">
                  Sugerencia: optimiza en {suggestion.category}
                </h4>
                <p className="text-[12px] text-[#8A7F72] font-medium leading-relaxed">
                  Podrías reducir aproximadamente ${suggestion.suggestedReduction.toLocaleString('es-MX')} al mes (un 20% de tus gastos en esta área).
                </p>
                <span className="inline-block text-[9.5px] font-extrabold text-[#7C5CD6] bg-[#F0ECFB] px-2 py-0.5 rounded-[8px] mt-2 tracking-wide">
                  GENERADO CON IA
                </span>
              </div>
            </div>
          )}

          {/* Card Gastos por Categoría */}
          {categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-[18px] p-5 border border-[#F1E4D7] shadow-sm">
              <h4 className="text-[13.5px] font-extrabold text-[#241B14] mb-3">
                Gastos por categoría
              </h4>
              <div className="divide-y divide-[#F1E4D7]">
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1 text-[12.5px] font-bold text-[#241B14]">
                      {cat.name}
                    </span>
                    <span className="text-[12.5px] font-extrabold text-[#241B14]">
                      ${cat.amt.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10.5px] text-[#8A7F72] font-semibold w-9 text-right">
                      {cat.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de Chat Interactivo con IA */}
          <div className="bg-white rounded-[18px] p-5 border border-[#F1E4D7] shadow-sm space-y-4">
            <h4 className="text-[13.5px] font-extrabold text-[#241B14]">
              Pregúntale a tu Chivito IA
            </h4>

            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[#8A7F72] font-medium">
                  Preguntas sugeridas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-[#FFF8F2] hover:bg-[#FFE4CE] text-[#241B14] text-xs font-semibold rounded-xl border border-[#F1E4D7] transition-all disabled:opacity-50 text-left"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3.5 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-medium text-sm ml-8 shadow-sm'
                        : 'bg-[#FBF6F0] text-[#241B14] text-sm mr-8 border border-[#F1E4D7]'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div
                        className="text-sm leading-relaxed whitespace-pre-wrap font-medium"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/\n/g, '<br />'),
                        }}
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3.5 bg-[#FBF6F0] rounded-2xl mr-8 border border-[#F1E4D7]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-[#8A7F72] font-semibold">Tu Chivito está pensando...</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-[#FDECE9] border border-[#FBD1C9] rounded-xl">
                <p className="text-xs text-[#E2523D] font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu consulta financiera..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 border-[1.5px] border-[#F1E4D7] rounded-xl bg-[#FBF6F0] focus:bg-white focus:border-orange focus:ring-4 focus:ring-orange-light outline-none text-sm font-semibold text-[#241B14] placeholder-[#C4B9AA] transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#FF8A42] to-[#E2610F] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIFinanceAnalytics;
