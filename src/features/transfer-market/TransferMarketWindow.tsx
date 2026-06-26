import React, { useState, useMemo } from 'react';
import type { Player, Club } from '../../types';
import type { TransferBid, IncomingBid, TransferHistoryEntry, TransferMarketState } from './types';
import { getTransferWindowPhase, getWeeksLeftInWindow } from './types';
import { placeBid, acceptCounterOffer } from './engine';

// ── Sub-tab type ──────────────────────────────────────────────────────────────
type MarketTab = 'market' | 'bids' | 'incoming' | 'history';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  marketPool: Player[];
  userClub: Club;
  allClubs: Club[];
  userBalance: number;
  currentWeek: number;
  marketState: TransferMarketState;
  onUpdateMarketState: (next: TransferMarketState) => void;
  /** Called with the full player object + cost when user completes a market purchase */
  onBuyPlayer: (player: Player, cost: number) => void;
  /** Called with playerId + sale amount when user accepts an incoming bid */
  onSellPlayer: (playerId: string, amount: number) => void;
  onAddNotification: (title: string, body: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`;
const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`;

const posColor: Record<string, string> = {
  GK: 'bg-yellow-500', DEF: 'bg-blue-500', MID: 'bg-green-500', ATT: 'bg-red-500',
};

const statusBadge = (status: TransferBid['status']) => {
  const cfg: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'Pending',   cls: 'bg-yellow-500/20 text-yellow-300' },
    accepted: { label: 'Accepted',  cls: 'bg-green-500/20  text-green-300'  },
    rejected: { label: 'Rejected',  cls: 'bg-red-500/20    text-red-300'    },
    countered:{ label: 'Countered', cls: 'bg-orange-500/20 text-orange-300' },
  };
  const { label, cls } = cfg[status] ?? cfg.pending;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

// ── Window banner ─────────────────────────────────────────────────────────────
function WindowBanner({ phase, weeksLeft, userBalance }: { phase: ReturnType<typeof getTransferWindowPhase>; weeksLeft: number; userBalance: number }) {
  if (phase === 'closed') {
    return (
      <div className="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
        <span className="text-red-400 text-lg">🔒</span>
        <div>
          <p className="text-red-300 font-semibold text-sm">Transfer Window Closed</p>
          <p className="text-red-400/70 text-xs">Opens again at Week 13 (Winter Window)</p>
        </div>
      </div>
    );
  }
  const label = phase === 'summer' ? '☀️ Summer' : '❄️ Winter';
  const urgency = weeksLeft === 1 ? 'bg-orange-900/40 border-orange-700/50' : 'bg-emerald-900/40 border-emerald-700/50';
  const textColor = weeksLeft === 1 ? 'text-orange-300' : 'text-emerald-300';
  return (
    <div className={`flex items-center justify-between ${urgency} border rounded-xl px-4 py-3 mb-4`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{label.split(' ')[0]}</span>
        <div>
          <p className={`${textColor} font-semibold text-sm`}>{label} Window Open</p>
          <p className="text-gray-400 text-xs">
            {weeksLeft === 1 ? '⚠️ Deadline this week!' : `${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-gray-400 text-xs">Balance</p>
        <p className="text-white font-bold text-sm">{fmtK(userBalance)}</p>
      </div>
    </div>
  );
}

// ── Market player card ────────────────────────────────────────────────────────
function MarketPlayerCard({
  player,
  canBid,
  userBalance,
  onBid,
}: {
  player: Player;
  canBid: boolean;
  userBalance: number;
  onBid: (player: Player, amount: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [bidInput, setBidInput] = useState(player.marketValue.toString());
  const asking = player.marketValue;
  const canAfford = userBalance >= asking * 0.70;

  return (
    <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/30 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className={`w-10 h-10 flex items-center justify-center rounded-lg text-white text-xs font-bold ${posColor[player.position] ?? 'bg-gray-600'}`}>
          {player.position}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{player.name}</p>
          <p className="text-gray-400 text-xs">Age {player.age} · Rating {player.rating}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-emerald-400 font-bold text-sm">{fmtK(asking)}</p>
          {!canAfford && <p className="text-red-400 text-xs">Insufficient funds</p>}
        </div>
        <span className="text-gray-500 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-700/40 pt-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {Object.entries(player.attributes ?? {}).map(([k, v]) => (
              <div key={k} className="text-center bg-gray-900/40 rounded-lg py-1.5">
                <p className="text-white font-bold text-sm">{v}</p>
                <p className="text-gray-500 text-xs capitalize">{k}</p>
              </div>
            ))}
          </div>

          {canBid && (
            <div className="flex gap-2">
              <input
                type="number"
                value={bidInput}
                onChange={e => setBidInput(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Bid amount"
              />
              <button
                onClick={() => onBid(player, Number(bidInput))}
                disabled={!canAfford || Number(bidInput) <= 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Bid
              </button>
            </div>
          )}
          {!canBid && (
            <p className="text-center text-gray-500 text-xs py-2">Window is closed — bids not available</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TransferMarketWindow({
  marketPool,
  userClub,
  allClubs,
  userBalance,
  currentWeek,
  marketState,
  onUpdateMarketState,
  onBuyPlayer,
  onSellPlayer,
  onAddNotification,
}: Props) {
  const [activeTab, setActiveTab] = useState<MarketTab>('market');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<number>(60);

  const phase = getTransferWindowPhase(currentWeek);
  const weeksLeft = getWeeksLeftInWindow(currentWeek);
  const isOpen = phase !== 'closed';

  const filteredPool = useMemo(() =>
    marketPool.filter(p =>
      (posFilter === 'ALL' || p.position === posFilter) && p.rating >= ratingFilter
    ).sort((a, b) => b.rating - a.rating),
    [marketPool, posFilter, ratingFilter]
  );

  function handleBid(player: Player, amount: number) {
    if (!isOpen) return;
    try {
      const bid = placeBid({
        player,
        bidAmount: amount,
        askingPrice: player.marketValue,
        currentWeek,
      });

      onUpdateMarketState({
        ...marketState,
        activeBids: [...marketState.activeBids, bid],
      });

      const msg =
        bid.status === 'accepted' ? `Bid accepted! Go to Bids to complete the transfer.` :
        bid.status === 'countered' ? `Club countered with ${fmtK(bid.counterOffer!)}` :
        `Bid rejected — try a higher offer`;
      onAddNotification(`Transfer Bid: ${player.name}`, msg);
    } catch {
      onAddNotification('Transfer Window', 'Transfer window is closed');
    }
  }

  function handleAcceptCounter(bidId: string) {
    const bid = marketState.activeBids.find(b => b.id === bidId);
    if (!bid) return;
    const updated = acceptCounterOffer(bid);
    onUpdateMarketState({
      ...marketState,
      activeBids: marketState.activeBids.map(b => b.id === bidId ? updated : b),
    });
  }

  function handleCompleteBuy(bidId: string) {
    const bid = marketState.activeBids.find(b => b.id === bidId);
    if (!bid || bid.status !== 'accepted') return;
    const marketPlayer = marketPool.find(p => p.id === bid.marketPlayerId);
    if (!marketPlayer) return;

    const cost = bid.counterOffer && bid.status === 'accepted' ? bid.counterOffer : bid.bidAmount;
    if (userBalance < cost) {
      onAddNotification('Insufficient Funds', `You need ${fmtK(cost)} to complete this transfer`);
      return;
    }

    // Use the existing buy handler (handles balance + squad update + financial ledger)
    onBuyPlayer(marketPlayer, cost);
    onUpdateMarketState({
      ...marketState,
      activeBids: marketState.activeBids.filter(b => b.id !== bidId),
      history: [...marketState.history, { id: `h-${Date.now()}`, week: bid.weekPlaced, type: 'bought', playerName: bid.playerName, amount: cost, clubName: 'Transfer Window', isLoan: bid.isLoan }],
    });
    onAddNotification(`${bid.playerName} Signed!`, `${bid.playerName} joins your squad for ${fmtK(cost)}`);
  }

  function handleAcceptIncoming(bidId: string) {
    const bid = marketState.incomingBids.find(b => b.id === bidId);
    if (!bid) return;
    // Use the existing sell handler (handles balance update + financial ledger)
    onSellPlayer(bid.playerId, bid.bidAmount);
    onUpdateMarketState({
      ...marketState,
      incomingBids: marketState.incomingBids.map(b => b.id === bidId ? { ...b, status: 'accepted' as const } : b),
      history: [...marketState.history, { id: `h-${Date.now()}`, week: bid.weekOffered, type: 'sold', playerName: bid.playerName, amount: bid.bidAmount, clubName: bid.fromClubName, isLoan: bid.isLoan }],
    });
    onAddNotification(`Transfer Complete`, `${bid.playerName} sold to ${bid.fromClubName} for ${fmtK(bid.bidAmount)}`);
  }

  function handleRejectIncoming(bidId: string) {
    onUpdateMarketState({
      ...marketState,
      incomingBids: marketState.incomingBids.map(b => b.id === bidId ? { ...b, status: 'rejected' as const } : b),
    });
  }

  const tabs: { id: MarketTab; label: string; badge?: number }[] = [
    { id: 'market',   label: 'Market' },
    { id: 'bids',     label: 'My Bids', badge: marketState.activeBids.filter(b => b.status === 'countered' || b.status === 'accepted').length || undefined },
    { id: 'incoming', label: 'Incoming', badge: marketState.incomingBids.filter(b => b.status === 'pending').length || undefined },
    { id: 'history',  label: 'History' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WindowBanner phase={phase} weeksLeft={weeksLeft} userBalance={userBalance} />

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 relative py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === t.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
            {t.badge != null && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── MARKET TAB ── */}
      {activeTab === 'market' && (
        <>
          <div className="flex gap-2">
            {(['ALL','GK','DEF','MID','ATT'] as const).map(pos => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  posFilter === pos ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-gray-500 text-xs">Min rating</span>
              <input
                type="range" min={50} max={90} step={5}
                value={ratingFilter}
                onChange={e => setRatingFilter(Number(e.target.value))}
                className="w-20 accent-blue-500"
              />
              <span className="text-white text-xs w-6">{ratingFilter}</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {filteredPool.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No players match your filters</p>
            ) : filteredPool.map(p => (
              <MarketPlayerCard
                key={p.id}
                player={p}
                canBid={isOpen}
                userBalance={userBalance}
                onBid={handleBid}
              />
            ))}
          </div>
        </>
      )}

      {/* ── BIDS TAB ── */}
      {activeTab === 'bids' && (
        <div className="flex flex-col gap-3">
          {marketState.activeBids.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No active bids — place offers in the Market tab</p>
          ) : marketState.activeBids.map(bid => (
            <div key={bid.id} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{bid.playerName}</p>
                  <p className="text-gray-400 text-xs">{bid.playerPosition} · Rating {bid.playerRating} · Age {bid.playerAge}</p>
                </div>
                {statusBadge(bid.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-gray-900/40 rounded-lg p-2">
                  <p className="text-gray-500">Your Bid</p>
                  <p className="text-white font-bold">{fmtK(bid.bidAmount)}</p>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2">
                  <p className="text-gray-500">Asking Price</p>
                  <p className="text-white font-bold">{fmtK(bid.askingPrice)}</p>
                </div>
              </div>
              {bid.status === 'countered' && bid.counterOffer && (
                <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-3 mb-3">
                  <p className="text-orange-300 text-xs font-medium mb-2">
                    Counter offer received: <strong>{fmtK(bid.counterOffer)}</strong>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptCounter(bid.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Accept Counter
                    </button>
                    <button
                      onClick={() => onUpdateMarketState({
                        ...marketState,
                        activeBids: marketState.activeBids.filter(b => b.id !== bid.id),
                      })}
                      className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
              {bid.status === 'accepted' && (
                <button
                  onClick={() => handleCompleteBuy(bid.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold"
                >
                  Complete Transfer ({fmtK(bid.bidAmount)})
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── INCOMING TAB ── */}
      {activeTab === 'incoming' && (
        <div className="flex flex-col gap-3">
          {marketState.incomingBids.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No offers for your players yet</p>
          ) : marketState.incomingBids.map(bid => (
            <div key={bid.id} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-white font-semibold text-sm">{bid.playerName}</p>
                  <p className="text-gray-400 text-xs">Rating {bid.playerRating} · Age {bid.playerAge}</p>
                </div>
                {bid.status !== 'pending' && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    bid.status === 'accepted' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mb-3">
                {bid.fromClubName} offers <strong className="text-white">{fmtK(bid.bidAmount)}</strong>
                {bid.isLoan ? ' (Loan)' : ''}
              </p>
              {bid.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptIncoming(bid.id)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectIncoming(bid.id)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-2">
          {marketState.history.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No transfer history yet</p>
          ) : [...marketState.history].reverse().map(entry => (
            <div key={entry.id} className="flex items-center gap-3 bg-gray-800/60 rounded-xl p-3 border border-gray-700/40">
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-white text-xs font-bold ${
                entry.type === 'bought' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                {entry.type === 'bought' ? '↓' : '↑'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{entry.playerName}</p>
                <p className="text-gray-400 text-xs">
                  Week {entry.week} · {entry.clubName}
                  {entry.isLoan ? ' (Loan)' : ''}
                </p>
              </div>
              <p className={`text-sm font-bold ${entry.type === 'sold' ? 'text-emerald-400' : 'text-blue-400'}`}>
                {entry.type === 'sold' ? '+' : '-'}{fmtK(entry.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
