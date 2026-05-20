import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type TransactionType = 'ingresos' | 'gastos' | 'deudas' | 'ahorros';

const BalanceDisplay: React.FC = () => {
  const { getBalance, transactions } = useFinance();
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>(['ingresos', 'gastos']);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const date = new Date();
    date.setFullYear(2026);
    return date.toISOString().split('T')[0];
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const date = new Date();
    date.setFullYear(2026);
    return `2026-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const getDateRange = () => {
    let startDate: Date;
    let endDate: Date;

    if (timeRange === 'all') {
      startDate = new Date(2000, 0, 1, 0, 0, 0);
      endDate = new Date(2100, 11, 31, 23, 59, 59);
    } else if (timeRange === 'daily') {
      const date = new Date(selectedDate);
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    } else if (timeRange === 'weekly') {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysToSubtract, 0, 0, 0);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59);
    } else if (timeRange === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      startDate = new Date(year, month - 1, 1, 0, 0, 0);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      startDate = new Date(selectedYear, 0, 1, 0, 0, 0);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();
  const balance = getBalance(startDate, endDate);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    if (timeRange === 'all') {
      return 'Todas las transacciones';
    } else if (timeRange === 'daily') {
      const date = new Date(selectedDate);
      return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    } else if (timeRange === 'weekly') {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysToSubtract);
      const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
      return `Semana del ${weekStart.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} al ${weekEnd.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else if (timeRange === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    } else {
      return `Año ${selectedYear}`;
    }
  };

  const getHistoricalData = () => {
    const now = new Date();
    now.setFullYear(2026);
    const dates: Date[] = [];
    const data: Record<TransactionType, number[]> = {
      ingresos: [],
      gastos: [],
      deudas: [],
      ahorros: []
    };

    // Generate date ranges based on selected time range
    if (timeRange === 'all') {
      for (let i = 0; i < 12; i++) {
        dates.unshift(new Date(2026, now.getMonth() - i, 1));
      }
    } else if (timeRange === 'daily') {
      for (let i = 0; i < 30; i++) {
        dates.unshift(new Date(2026, now.getMonth(), now.getDate() - i));
      }
    } else if (timeRange === 'weekly') {
      for (let i = 0; i < 12; i++) {
        dates.unshift(new Date(2026, now.getMonth(), now.getDate() - (i * 7)));
      }
    } else if (timeRange === 'monthly') {
      for (let i = 0; i < 12; i++) {
        dates.unshift(new Date(2026, now.getMonth() - i, 1));
      }
    } else {
      for (let i = 0; i < 12; i++) {
        dates.unshift(new Date(selectedYear, i, 1));
      }
    }

    // Calculate totals for each date range
    dates.forEach((date, index) => {
      let nextDate: Date;

      if (timeRange === 'all' || timeRange === 'monthly') {
        nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      } else if (timeRange === 'yearly') {
        nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      } else if (timeRange === 'daily') {
        nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      } else if (timeRange === 'weekly') {
        nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6, 23, 59, 59);
      } else {
        nextDate = index < dates.length - 1 ? dates[index + 1] : new Date();
      }

      const periodTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= date && transDate <= nextDate;
      });

      data.ingresos.push(periodTransactions.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0));
      data.gastos.push(periodTransactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.amount, 0));
      data.deudas.push(periodTransactions.filter(t => t.type === 'deuda').reduce((sum, t) => sum + t.amount, 0));
      data.ahorros.push(periodTransactions.filter(t => t.type === 'ahorro').reduce((sum, t) => sum + t.amount, 0));
    });

    return {
      labels: dates.map(date => {
        if (timeRange === 'all') {
          return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        } else if (timeRange === 'daily') {
          return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
        } else if (timeRange === 'weekly') {
          return `Sem ${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString('es-MX', { month: 'short' })}`;
        } else if (timeRange === 'monthly') {
          return date.toLocaleDateString('es-MX', { month: 'long', year: '2-digit' });
        } else {
          return date.toLocaleDateString('es-MX', { month: 'short' });
        }
      }),
      datasets: selectedTypes.map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        data: data[type],
        borderColor: type === 'ingresos' ? '#728c6a' : 
                    type === 'gastos' ? '#EF4444' : 
                    type === 'deudas' ? '#F59E0B' : '#3B82F6',
        backgroundColor: type === 'ingresos' ? '#728c6a20' : 
                        type === 'gastos' ? '#EF444420' : 
                        type === 'deudas' ? '#F59E0B20' : '#3B82F620',
        tension: 0.3,
        fill: true
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value)
        }
      }
    }
  };

  // Calculate percentages for the bar graph
  const total = balance.ingresos + balance.gastos;
  const ingresosPercent = total > 0 ? (balance.ingresos / total) * 100 : 0;
  const gastosPercent = total > 0 ? (balance.gastos / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-800">Balance Actual</h2>
          <p className="text-sm text-gray-500">Organiza tu lana, sin tanto rollo.</p>
        </div>

        <div className="flex items-baseline justify-between">
          <p className={`text-5xl font-bold ${balance.total >= 0 ? 'text-gray-800' : 'text-coral-600'}`}>
            {formatCurrency(balance.total)}
          </p>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500"
          >
            <option value="monthly">Meses</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="yearly">Anual</option>
            <option value="all">Todo</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-cream-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Ingresos</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(balance.ingresos)}</p>
          </div>

          <div className="bg-coral-50 p-4 rounded-lg">
            <p className="text-sm text-coral-600 mb-1">Gastos</p>
            <p className="text-2xl font-bold text-coral-600">{formatCurrency(balance.gastos)}</p>
          </div>

          <div className="bg-cream-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Deudas</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(balance.deudas)}</p>
          </div>

          <div className="bg-cream-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Ahorros</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(balance.ahorros)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['ingresos', 'gastos', 'deudas', 'ahorros'] as TransactionType[]).map(type => (
            <button
              key={type}
              onClick={() => {
                setSelectedTypes(prev =>
                  prev.includes(type)
                    ? prev.filter(t => t !== type)
                    : [...prev, type]
                );
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTypes.includes(type)
                  ? 'bg-sage-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm" style={{ height: '400px' }}>
          <Line
            key={`${timeRange}-${selectedTypes.join('-')}`}
            options={chartOptions}
            data={getHistoricalData()}
          />
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplay;