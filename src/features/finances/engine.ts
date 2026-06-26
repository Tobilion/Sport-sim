import type { Club } from '../../types';
import type { FinancialEntry, FinancialCategory } from './types';
import { calcWeeklyWageBill, calcMatchdayRevenue } from './types';

const uid = () => `fin-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

function entry(
  week: number,
  category: FinancialCategory,
  description: string,
  amount: number,
): FinancialEntry {
  return { id: uid(), week, category, description, amount };
}

// ── Weekly automatic entries ──────────────────────────────────────────────────
export function buildWeeklyWageEntry(
  userClub: Club,
  currentWeek: number,
): FinancialEntry {
  const avgRating = userClub.squad.length > 0
    ? userClub.squad.reduce((s, p) => s + p.rating, 0) / userClub.squad.length
    : 60;
  const coachCount = (userClub.coaches?.length ?? 0) + 1;
  const wageBill = calcWeeklyWageBill(userClub.squad.length, avgRating, coachCount);
  return entry(currentWeek, 'wages', `Week ${currentWeek} wage bill`, -wageBill);
}

// ── Match result entry ────────────────────────────────────────────────────────
export function buildMatchdayEntry(params: {
  isHome: boolean;
  won: boolean;
  opponentName: string;
  clubRating: number;
  week: number;
}): FinancialEntry | null {
  const { isHome, won, opponentName, clubRating, week } = params;
  const revenue = calcMatchdayRevenue(isHome, won, clubRating);
  if (revenue === 0) return null;
  return entry(week, 'matchday', `Matchday vs ${opponentName}`, revenue);
}

// ── Transfer entries ──────────────────────────────────────────────────────────
export function buildTransferInEntry(
  playerName: string,
  amount: number,
  week: number,
): FinancialEntry {
  return entry(week, 'transfer_in', `Sold ${playerName}`, amount);
}

export function buildTransferOutEntry(
  playerName: string,
  amount: number,
  week: number,
): FinancialEntry {
  return entry(week, 'transfer_out', `Bought ${playerName}`, -Math.abs(amount));
}

// ── Facility upgrade cost ─────────────────────────────────────────────────────
export function buildFacilityEntry(
  facilityName: string,
  cost: number,
  week: number,
): FinancialEntry {
  return entry(week, 'facility', `${facilityName} upgrade`, -Math.abs(cost));
}

// ── Prize money ───────────────────────────────────────────────────────────────
const LEAGUE_PRIZES: Record<number, number> = {
  1: 2_000_000,
  2: 1_200_000,
  3: 700_000,
  4: 400_000,
  5: 250_000,
};

export function buildLeaguePrizeEntry(leaguePosition: number, week: number): FinancialEntry {
  const prize = LEAGUE_PRIZES[leaguePosition] ?? Math.max(50_000, 200_000 - leaguePosition * 10_000);
  return entry(week, 'prize_money', `League finish prize (P${leaguePosition})`, prize);
}

const CUP_PRIZES: Record<string, number> = {
  Winner: 1_500_000,
  F:      800_000,
  SF:     400_000,
  QF:     200_000,
  R16:    100_000,
  R32:     50_000,
};

export function buildCupPrizeEntry(cupRound: string, week: number): FinancialEntry {
  const prize = CUP_PRIZES[cupRound] ?? 25_000;
  return entry(week, 'prize_money', `Cup prize (${cupRound})`, prize);
}

// ── Board objective reward ────────────────────────────────────────────────────
export function buildObjectiveBonusEntry(
  description: string,
  reward: number,
  week: number,
): FinancialEntry {
  return entry(week, 'bonus', `Board objective: ${description}`, reward);
}
