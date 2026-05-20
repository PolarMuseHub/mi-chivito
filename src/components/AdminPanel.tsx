import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface OnboardingSummary {
  total_users: number;
  total_completions: number;
  last_completion: string | null;
}

interface ArchetypeRow {
  archetype_id: string;
  total_users: number;
  percentage: number;
}

interface ValueTotalRow {
  value: string | null;
  total: number;
}

interface AdminData {
  summary: OnboardingSummary | null;
  archetypes: ArchetypeRow[];
  incomeFrequency: ValueTotalRow[];
  savingsMethod: ValueTotalRow[];
  surplusBehavior: ValueTotalRow[];
  emergencyFund: ValueTotalRow[];
  goalType: ValueTotalRow[];
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }

    setAuthorized(true);

    const [
      summaryRes,
      archetypesRes,
      incomeRes,
      savingsRes,
      surplusRes,
      emergencyRes,
      goalRes,
    ] = await Promise.all([
      supabase.from('v_onboarding_summary').select('*').maybeSingle(),
      supabase.from('v_archetype_distribution').select('*'),
      supabase.from('v_income_frequency').select('*'),
      supabase.from('v_savings_method').select('*'),
      supabase.from('v_surplus_behavior').select('*'),
      supabase.from('v_emergency_fund').select('*'),
      supabase.from('v_goal_type').select('*'),
    ]);

    setData({
      summary: summaryRes.data as OnboardingSummary | null,
      archetypes: (archetypesRes.data ?? []) as ArchetypeRow[],
      incomeFrequency: (incomeRes.data ?? []) as ValueTotalRow[],
      savingsMethod: (savingsRes.data ?? []) as ValueTotalRow[],
      surplusBehavior: (surplusRes.data ?? []) as ValueTotalRow[],
      emergencyFund: (emergencyRes.data ?? []) as ValueTotalRow[],
      goalType: (goalRes.data ?? []) as ValueTotalRow[],
    });

    setLoading(false);
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Verificando acceso...</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel de analisis</h1>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Volver
          </button>
        </div>

        <Section title="Resumen de onboarding">
          {data.summary ? (
            <dl className="grid grid-cols-3 gap-4">
              <StatCard label="Usuarios totales" value={data.summary.total_users} />
              <StatCard label="Completaron" value={data.summary.total_completions} />
              <StatCard
                label="Ultimo completado"
                value={data.summary.last_completion
                  ? new Date(data.summary.last_completion).toLocaleDateString('es-MX')
                  : '—'}
              />
            </dl>
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </Section>

        <Section title="Distribucion de arquetipos">
          <SimpleTable
            headers={['Arquetipo', 'Usuarios', '%']}
            rows={data.archetypes.map(r => [
              r.archetype_id ?? '—',
              String(r.total_users),
              `${Number(r.percentage).toFixed(1)}%`,
            ])}
          />
        </Section>

        <ValueTotalSection title="Frecuencia de ingresos" rows={data.incomeFrequency} />
        <ValueTotalSection title="Metodo de ahorro" rows={data.savingsMethod} />
        <ValueTotalSection title="Comportamiento con sobrantes" rows={data.surplusBehavior} />
        <ValueTotalSection title="Fondo de emergencia" rows={data.emergencyFund} />
        <ValueTotalSection title="Tipo de meta" rows={data.goalType} />
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <dt className="text-xs text-gray-500 mb-1">{label}</dt>
      <dd className="text-xl font-bold text-gray-900">{value}</dd>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return <p className="text-gray-400 text-sm">Sin datos</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          {headers.map((h) => (
            <th key={h} className="text-left py-2 pr-4 font-medium text-gray-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-100">
            {row.map((cell, j) => (
              <td key={j} className="py-2 pr-4 text-gray-800">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ValueTotalSection({ title, rows }: { title: string; rows: ValueTotalRow[] }) {
  return (
    <Section title={title}>
      <SimpleTable
        headers={['Valor', 'Total']}
        rows={rows.map(r => [r.value ?? '(vacio)', String(r.total)])}
      />
    </Section>
  );
}

export default AdminPanel;
