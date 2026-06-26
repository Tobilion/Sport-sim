import type { Player } from '../../types';

// ── Window schedule ────────────────────────────────────────────────────────────
export type TransferWindowPhase = 'summer' | 'winter' | 'closed';

const SUMMER_WEEKS = [1, 2, 3];
const WINTER_WEEKS = [13, 14];

export function getTransferWindowPhase(week: number): TransferWindowPhase {
  if (SUMMER_WEEKS.includes(week)) return 'summer';
  if (WINTER_WEEKS.includes(week)) return 'winter';
  return 'closed';
}

export function getWindowDeadlineWeek(week: number): number {
  if (SUMMER_WEEKS.includes(week)) return 3;
  if (WINTER_WEEKS.includes(week)) return 14;
  return -1; // closed
}

export function getWeeksLeftInWindow(week: number): number {
  const deadline = getWindowDeadlineWeek(week);
  if (deadline === -1) return 0;
  return deadline - week + 1;
}

// ── Bid types ─────────────────────────────────────────────────────────────────
export interface TransferBid {
  id: string;
  marketPlayerId: string;
  playerName: string;
  playerRating: number;
  playerPosition: string;
  playerAge: number;
  askingPrice: number;
  bidAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterOffer?: number;
  isLoan: boolean;
  weekPlaced: number;
}

export interface IncomingBid {
  id: string;
  playerId: string;        // id within user's squad
  playerName: string;
  playerRating: number;
  playerAge: number;
  bidAmount: number;
  fromClubName: string;
  fromClubId: string;
  weekOffered: number;
  isLoan: boolean;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface TransferHistoryEntry {
  id: string;
  week: number;
  type: 'bought' | 'sold';
  playerName: string;
  amount: number;
  clubName: string;
  isLoan: boolean;
}

// ── Full market state (persisted in App useState) ──────────────────────────────
export interface TransferMarketState {
  activeBids: TransferBid[];
  incomingBids: IncomingBid[];
  history: TransferHistoryEntry[];
}

export const EMPTY_TRANSFER_STATE: TransferMarketState = {
  activeBids: [],
  incomingBids: [],
  history: [],
};
