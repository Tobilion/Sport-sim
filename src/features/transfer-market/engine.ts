import type { Club, Player } from '../../types';
import type {
  TransferBid,
  IncomingBid,
  TransferHistoryEntry,
  TransferMarketState,
} from './types';
import { getTransferWindowPhase } from './types';

const uid = () => `bid-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

// ── Place a bid on a market-pool player ──────────────────────────────────────
export function placeBid(params: {
  player: Player;
  bidAmount: number;
  askingPrice: number;
  currentWeek: number;
  isLoan?: boolean;
}): TransferBid {
  const { player, bidAmount, askingPrice, currentWeek, isLoan = false } = params;
  const phase = getTransferWindowPhase(currentWeek);
  if (phase === 'closed') throw new Error('Transfer window is closed');

  // Determine immediate result: accept if bid ≥ 90% of asking; counter at 75-89%; reject below
  const ratio = bidAmount / askingPrice;
  let status: TransferBid['status'];
  let counterOffer: number | undefined;

  if (ratio >= 0.90) {
    status = 'accepted';
  } else if (ratio >= 0.70) {
    status = 'countered';
    counterOffer = Math.round(askingPrice * (0.88 + Math.random() * 0.08) / 25000) * 25000;
  } else {
    status = 'rejected';
  }

  return {
    id: uid(),
    marketPlayerId: player.id,
    playerName: player.name,
    playerRating: player.rating,
    playerPosition: player.position,
    playerAge: player.age,
    askingPrice,
    bidAmount,
    status,
    counterOffer,
    isLoan,
    weekPlaced: currentWeek,
  };
}

// ── Accept a counter-offer ────────────────────────────────────────────────────
export function acceptCounterOffer(bid: TransferBid): TransferBid {
  if (bid.status !== 'countered' || bid.counterOffer == null) return bid;
  return { ...bid, status: 'accepted', bidAmount: bid.counterOffer };
}

// ── Generate AI incoming bids on user's players ──────────────────────────────
// Called once per week when window is open
export function generateIncomingBids(
  userClub: Club,
  allClubs: Club[],
  currentWeek: number,
): IncomingBid[] {
  const phase = getTransferWindowPhase(currentWeek);
  if (phase === 'closed') return [];

  const aiClubs = allClubs.filter(c => c.id !== userClub.id);
  const bids: IncomingBid[] = [];

  // Try to bid on 0-2 of the user's players rated 70+
  const eligiblePlayers = userClub.squad
    .filter(p => !p.isYouth && p.rating >= 70)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3)); // 0-2 players

  for (const player of eligiblePlayers) {
    if (Math.random() < 0.45) continue; // 55% chance of no bid
    const bidder = aiClubs[Math.floor(Math.random() * aiClubs.length)];
    const bidAmount = Math.round(
      player.marketValue * (0.75 + Math.random() * 0.40) / 25000,
    ) * 25000;
    const isLoan = player.age <= 23 && Math.random() < 0.3;

    bids.push({
      id: uid(),
      playerId: player.id,
      playerName: player.name,
      playerRating: player.rating,
      playerAge: player.age,
      bidAmount,
      fromClubName: bidder.name,
      fromClubId: bidder.id,
      weekOffered: currentWeek,
      isLoan,
      status: 'pending',
    });
  }

  return bids;
}

// ── Accept an incoming bid (user sells their player) ─────────────────────────
export function acceptIncomingBid(params: {
  bid: IncomingBid;
  clubs: Club[];
  userClubId: string;
  userBalance: number;
}): {
  updatedClubs: Club[];
  newBalance: number;
  historyEntry: TransferHistoryEntry;
} {
  const { bid, clubs, userClubId, userBalance } = params;

  const updatedClubs = clubs.map(club => {
    if (club.id !== userClubId) return club;
    return {
      ...club,
      squad: club.squad.filter(p => p.id !== bid.playerId),
    };
  });

  return {
    updatedClubs,
    newBalance: userBalance + bid.bidAmount,
    historyEntry: {
      id: uid(),
      week: bid.weekOffered,
      type: 'sold',
      playerName: bid.playerName,
      amount: bid.bidAmount,
      clubName: bid.fromClubName,
      isLoan: bid.isLoan,
    },
  };
}

// ── Buy a player after a bid is accepted ─────────────────────────────────────
export function buyPlayerFromMarket(params: {
  bid: TransferBid;
  player: Player;
  clubs: Club[];
  userClubId: string;
  userBalance: number;
}): {
  updatedClubs: Club[];
  newBalance: number;
  historyEntry: TransferHistoryEntry;
} {
  const { bid, player, clubs, userClubId, userBalance } = params;
  const cost = bid.status === 'accepted' && bid.counterOffer
    ? bid.counterOffer
    : bid.bidAmount;

  const updatedClubs = clubs.map(club => {
    if (club.id !== userClubId) return club;
    return { ...club, squad: [...club.squad, { ...player, isStarting: false }] };
  });

  return {
    updatedClubs,
    newBalance: userBalance - cost,
    historyEntry: {
      id: uid(),
      week: bid.weekPlaced,
      type: 'bought',
      playerName: bid.playerName,
      amount: cost,
      clubName: 'Transfer Market',
      isLoan: bid.isLoan,
    },
  };
}

// ── Add history entries from regular buy/sell operations ──────────────────────
export function makeHistoryEntry(params: {
  type: 'bought' | 'sold';
  playerName: string;
  amount: number;
  clubName: string;
  week: number;
  isLoan?: boolean;
}): TransferHistoryEntry {
  return { id: uid(), isLoan: false, ...params };
}

// ── Dismiss stale bids from previous window ───────────────────────────────────
export function purgeStaleBids(state: TransferMarketState, currentWeek: number): TransferMarketState {
  const phase = getTransferWindowPhase(currentWeek);
  if (phase !== 'closed') return state;
  return {
    ...state,
    activeBids: state.activeBids.filter(b => b.status === 'accepted'),
    incomingBids: state.incomingBids.filter(b => b.status === 'accepted'),
  };
}
