import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { FinancialEntry, FinancialCategory } from './types';
import { buildFinancialSummary, calcWeeklyWageBill } from './types';
import type { Club } from '../../types';

interface Props {
  ledger: FinancialEntry[];
  userClub: Club;
  userBalance: number;
  currentWeek: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
};

const CATEGORY_META: Record<FinancialCategory, { label: string; color: string; icon: string }> = {
  matchday:     { label: 'Matchday',      color: '#3b82f6', icon: '🏟️' },
  prize_money:  { label: 'Prize Money',   color: '#a855f7', icon: '🏆' },
  transfer_in:  { label: 'Player Sales',  color: '#22c55e', icon: '💸' },
  transfer_out: { label: 'Transfers',     color: '#ef4444', icon: '🛒' },
  wages:        { label: 'Wages',         color: '#f97316', icon: '👥' },
  facility:     { label: 'Facilities',    color: '#eab308', icon: '🏗️' },
  bonus:        { label: 'Bonuses',       color: '#06b6d4', icon: '⭐' },
  other:        { label: 'Other',         color: '#6b7280', icon: '📋' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, positive }: {
  label: string; value: string; sub?: string; positive?: boolean;
}) {
  return (
    <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
      <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${
        positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-red-400'
      }`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-gray-300 font-medium mb-2">Week {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'income' ? '↑' : '↓'} {fmt(Math.abs(p.value))}
        </p>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function FinancialDashboard({ ledger, userClub, userBalance, currentWeek }: Props) {
  const [view, setView] = useState<'overview' | 'breakdown' | 'ledger'>('overview');
  const summary = useMemo(() => buildFinancialSummary(ledger), [ledger]);

  // Wage estimate
  const avgRating = userClub.squad.length > 0
    ? userClub.squad.reduce((s, p) => s + p.rating, 0) / userClub.squad.length
    : 60;
  const coachCount = (userClub.coaches?.length ?? 0) + 1;
  const weeklyWage = calcWeeklyWageBill(userClub.squad.length, avgRating, coachCount);
  const wagesRemaining = (26 - currentWeek) * weeklyWage;

  // Pie chart data (income categories only, positives)
  const incomeCategories = (['matchday', 'prize_money', 'transfer_in', 'bonus'] as FinancialCategory[])
    .map(cat => ({ name: CATEGORY_META[cat].label, value: Math.max(0, summary.byCategory[cat]), color: CATEGORY_META[cat].color }))
    .filter(d => d.value > 0);

  const expenseCategories = (['wages', 'transfer_out', 'facility'] as FinancialCategory[])
    .map(cat => ({ name: CATEGORY_META[cat].label, value: Math.abs(Math.min(0, summary.byCategory[cat])), color: CATEGORY_META[cat].color }))
    .filter(d => d.value > 0);

  // Weekly bar data — last 10 weeks
  const barData = summary.byWeek.slice(-10).map(w => ({
    week: w.week,
    income: w.income,
    expense: Math.abs(w.expense),
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1">
        {(['overview', 'breakdown', 'ledger'] as const).map(t => (
          <button
            key={t}
            onClick={() => setView(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${
              view === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {view === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Current Balance"  value={fmt(userBalance)}          positive={userBalance >= 0} />
            <StatCard label="Season Net"        value={fmt(summary.netResult)}    positive={summary.netResult >= 0} />
            <StatCard label="Total Income"      value={fmt(summary.totalIncome)}  positive={true} />
            <StatCard label="Total Expenses"    value={fmt(summary.totalExpenses)} positive={false} />
          </div>

          {/* Wage budget */}
          <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Wage Budget</p>
              <span className="text-gray-400 text-xs">{fmt(weeklyWage)} / week</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <p className="text-orange-400 font-bold text-sm">{fmt(Math.abs(summary.wageSpend))}</p>
                <p className="text-gray-500 text-xs">Spent to date</p>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{fmt(weeklyWage * currentWeek)}</p>
                <p className="text-gray-500 text-xs">Season projected</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold text-sm">{fmt(wagesRemaining)}</p>
                <p className="text-gray-500 text-xs">Remaining</p>
              </div>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(100, (currentWeek / 26) * 100)}%` }}
              />
            </div>
          </div>

          {/* Weekly bar chart */}
          {barData.length > 0 && (
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
              <p className="text-white font-semibold text-sm mb-3">Weekly Cash Flow</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="income"  fill="#22c55e" radius={[3,3,0,0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Transfer balance */}
          <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
            <p className="text-white font-semibold text-sm mb-2">Transfer Balance</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-emerald-400 font-bold">{fmt(summary.byCategory.transfer_in)}</p>
                <p className="text-gray-500 text-xs">Income</p>
              </div>
              <div>
                <p className={`font-bold ${summary.transferBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(summary.transferBalance)}
                </p>
                <p className="text-gray-500 text-xs">Net</p>
              </div>
              <div>
                <p className="text-red-400 font-bold">{fmt(Math.abs(summary.byCategory.transfer_out))}</p>
                <p className="text-gray-500 text-xs">Spent</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BREAKDOWN ── */}
      {view === 'breakdown' && (
        <>
          {incomeCategories.length > 0 && (
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
              <p className="text-white font-semibold text-sm mb-3">Income Sources</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={incomeCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {incomeCategories.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {expenseCategories.length > 0 && (
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
              <p className="text-white font-semibold text-sm mb-3">Expense Breakdown</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {expenseCategories.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category list */}
          <div className="flex flex-col gap-2">
            {(Object.keys(CATEGORY_META) as FinancialCategory[]).map(cat => {
              const val = summary.byCategory[cat];
              if (val === 0) return null;
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/40">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-gray-300 text-sm flex-1">{meta.label}</span>
                  <span className={`font-bold text-sm ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(val)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── LEDGER ── */}
      {view === 'ledger' && (
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {ledger.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No financial records yet</p>
          ) : [...ledger].reverse().map(entry => {
            const meta = CATEGORY_META[entry.category];
            return (
              <div key={entry.id} className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/40">
                <span className="text-base shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{entry.description}</p>
                  <p className="text-gray-500 text-xs">Week {entry.week} · {meta.label}</p>
                </div>
                <span className={`font-bold text-sm shrink-0 ${entry.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {entry.amount >= 0 ? '+' : ''}{fmt(entry.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
