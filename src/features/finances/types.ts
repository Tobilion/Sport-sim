// ── Categories ─────────────────────────────────────────────────────────────────
export type FinancialCategory =
  | 'matchday'       // ticket revenue from home wins / gate receipts
  | 'prize_money'    // end-of-season / cup prize
  | 'transfer_in'    // received from player sale
  | 'transfer_out'   // paid for player purchase
  | 'wages'          // weekly squad + coaches wage bill
  | 'facility'       // facility upgrade costs
  | 'bonus'          // achievement / objective bonuses
  | 'other';

export interface FinancialEntry {
  id: string;
  week: number;
  category: FinancialCategory;
  description: string;
  amount: number;    // positive = income, negative = expense
}

// ── Aggregation helpers ────────────────────────────────────────────────────────
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  wageSpend: number;
  transferBalance: number;    // transfer_in minus transfer_out
  matchdayRevenue: number;
  byCategory: Record<FinancialCategory, number>;
  byWeek: { week: number; income: number; expense: number; net: number }[];
}

export function buildFinancialSummary(entries: FinancialEntry[]): FinancialSummary {
  const byCategory: Record<FinancialCategory, number> = {
    matchday: 0, prize_money: 0, transfer_in: 0, transfer_out: 0,
    wages: 0, facility: 0, bonus: 0, other: 0,
  };

  const weekMap: Record<number, { income: number; expense: number }> = {};

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const e of entries) {
    byCategory[e.category] += e.amount;
    if (e.amount > 0) totalIncome += e.amount;
    else totalExpenses += e.amount;

    if (!weekMap[e.week]) weekMap[e.week] = { income: 0, expense: 0 };
    if (e.amount > 0) weekMap[e.week].income += e.amount;
    else weekMap[e.week].expense += e.amount;
  }

  const byWeek = Object.keys(weekMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(week => ({
      week,
      income: weekMap[week].income,
      expense: weekMap[week].expense,
      net: weekMap[week].income + weekMap[week].expense,
    }));

  return {
    totalIncome,
    totalExpenses,
    netResult: totalIncome + totalExpenses,
    wageSpend: byCategory.wages,
    transferBalance: byCategory.transfer_in + byCategory.transfer_out,
    matchdayRevenue: byCategory.matchday,
    byCategory,
    byWeek,
  };
}

// ── Wage calculation ──────────────────────────────────────────────────────────
export function calcWeeklyWageBill(squadSize: number, avgRating: number, coachCount: number): number {
  const playerWages = squadSize * avgRating * 400;         // ~£400 per rating point per player
  const coachWages  = coachCount * 8_000;                  // £8k per coach
  return Math.round((playerWages + coachWages) / 1000) * 1000;
}

// ── Matchday revenue ──────────────────────────────────────────────────────────
export function calcMatchdayRevenue(isHome: boolean, won: boolean, rating: number): number {
  if (!isHome) return 0;
  const base = 50_000 + rating * 500;
  const bonus = won ? 25_000 : 0;
  return Math.round((base + bonus) / 5000) * 5000;
}
