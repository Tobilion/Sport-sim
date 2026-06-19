import React, { useState } from 'react';
import { Ticket, Coins, ShieldCheck, TrendingUp, Sparkles, X, AlertCircle } from 'lucide-react';
import { Club, LiveOdds, BetType, BetSelection, BetTicket, LiveMatchSimulation, Fixture } from '../types';

interface SportsbookProps {
  userBalance: number;
  availableFixtures: Fixture[];
  allClubs: Club[];
  activeSimulation: LiveMatchSimulation | null;
  pendingTickets: BetTicket[];
  onPlaceTicket: (selections: BetSelection[], stake: number) => void;
  onCashoutTicket: (ticketId: string, cashoutVal: number) => void;
  liveOddsCurrent: LiveOdds | null;
}

export const Sportsbook: React.FC<SportsbookProps> = ({
  userBalance,
  availableFixtures,
  allClubs,
  activeSimulation,
  pendingTickets,
  onPlaceTicket,
  onCashoutTicket,
  liveOddsCurrent
}) => {
  const [activeSlip, setActiveSlip] = useState<BetSelection[]>([]);
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const getClub = (id: string) => allClubs.find(c => c.id === id);

  const isSelected = (fixtureId: string, betType: BetType) => {
    return activeSlip.some(s => s.fixtureId === fixtureId && s.betType === betType);
  };

  const handleAddSelection = (
    fixtureId: string,
    homeTeamName: string,
    awayTeamName: string,
    betType: BetType,
    label: string,
    odds: number
  ) => {
    if (activeSimulation && activeSimulation.fixtureId === fixtureId && activeSimulation.tick >= 28) {
      setErrorMessage('Betting is suspended near full time!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const filtered = activeSlip.filter(s => s.fixtureId !== fixtureId);
    
    if (filtered.length >= 4) {
      setErrorMessage('Double-Up Accumulators are limited to a maximum of 4 combined fixtures!');
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    const newSelection: BetSelection = {
      fixtureId,
      homeTeamName,
      awayTeamName,
      betType,
      selectedLabel: label,
      odds,
      status: 'PENDING'
    };

    setActiveSlip([...filtered, newSelection]);
  };

  const handleRemoveSelection = (fixtureId: string) => {
    setActiveSlip(activeSlip.filter(s => s.fixtureId !== fixtureId));
  };

  const totalOdds = activeSlip.length > 0 
    ? parseFloat(activeSlip.reduce((acc, s) => acc * s.odds, 1).toFixed(2)) 
    : 1.0;

  const potentialPayout = parseFloat((totalOdds * stakeAmount).toFixed(2));

  const handlePlaceBet = () => {
    if (activeSlip.length === 0) {
      setErrorMessage('Your betslip is currently empty!');
      return;
    }
    if (stakeAmount <= 0) {
      setErrorMessage('Please enter a valid stake amount exceeding $0.');
      return;
    }
    if (userBalance < stakeAmount) {
      setErrorMessage('Insufficient virtual funds in your balance!');
      return;
    }

    onPlaceTicket(activeSlip, stakeAmount);
    setActiveSlip([]);
    setStakeAmount(100);
    setErrorMessage('');
  };

  return (
    <div className="flex flex-col gap-4 h-full select-none">
      <div className="bg-[#121620] rounded-2xl border border-white/10 p-4 flex flex-col gap-3 min-h-[220px] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Matchday Live Odds Board</h3>
          </div>
          {activeSimulation ? (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE BETTING ON
            </span>
          ) : (
            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-mono">PRE-MATCH MODE</span>
          )}
        </div>

        {availableFixtures.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No active fixtures loaded in the schedule. Advance rounds or start campaign.
          </div>
        ) : (
          <div className="space-y-4">
            {availableFixtures.map(fixture => {
              const homeClub = getClub(fixture.homeClubId);
              const awayClub = getClub(fixture.awayClubId);
              if (!homeClub || !awayClub) return null;

              const isLive = activeSimulation && activeSimulation.fixtureId === fixture.id;
              
              if (fixture.isCompleted) return null;

              const homePower = homeClub.squad.reduce((s, p) => s + p.rating, 0) / 16;
              const awayPower = awayClub.squad.reduce((s, p) => s + p.rating, 0) / 16;
              const diffStrength = homePower - awayPower;

              const oHome = parseFloat(Math.min(15.0, Math.max(1.05, 2.2 - diffStrength * 0.15)).toFixed(2));
              const oDraw = parseFloat(Math.min(6.5, Math.max(2.1, 3.2 - Math.abs(diffStrength) * 0.05)).toFixed(2));
              const oAway = parseFloat(Math.min(15.0, Math.max(1.05, 2.6 + diffStrength * 0.15)).toFixed(2));

              const oOver2 = parseFloat((1.85 - diffStrength * 0.02).toFixed(2));
              const oUnder2 = parseFloat((1.90 + diffStrength * 0.02).toFixed(2));

              const cleanHomeOdds = isLive && liveOddsCurrent ? liveOddsCurrent.homeWin : oHome;
              const cleanDrawOdds = isLive && liveOddsCurrent ? liveOddsCurrent.draw : oDraw;
              const cleanAwayOdds = isLive && liveOddsCurrent ? liveOddsCurrent.awayWin : oAway;

              const cleanOverOdds = isLive && liveOddsCurrent ? liveOddsCurrent.over25 : oOver2;
              const cleanUnderOdds = isLive && liveOddsCurrent ? liveOddsCurrent.under25 : oUnder2;

              return (
                <div key={fixture.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3 relative overflow-hidden">
                  {isLive && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 animate-pulse"></div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">Wk {fixture.week}</span>
                      <span className="text-xs font-bold text-white uppercase truncate max-w-[170px]">
                        {homeClub.name} vs {awayClub.name}
                      </span>
                    </div>

                    {isLive ? (
                      <span className="text-[9px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded flex items-center gap-1">
                        LIVE - T{activeSimulation.tick}/30
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                        PRE-MATCH
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">Full-Time Result (1X2)</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          id={`odds-home-${fixture.id}`}
                          onClick={() => handleAddSelection(fixture.id, homeClub.name, awayClub.name, '1X2_HOME', `${homeClub.name} Win`, cleanHomeOdds)}
                          disabled={isLive && activeSimulation?.tick ? activeSimulation.tick >= 28 : false}
                          className={`flex flex-col items-center py-2 border rounded-lg transition-all ${
                            isSelected(fixture.id, '1X2_HOME')
                              ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                          } disabled:opacity-30`}
                        >
                          <span className="text-[8px] opacity-70">1 ({homeClub.name.substring(0, 3)})</span>
                          <span className="font-mono text-xs">{cleanHomeOdds}</span>
                        </button>

                        <button
                          id={`odds-draw-${fixture.id}`}
                          onClick={() => handleAddSelection(fixture.id, homeClub.name, awayClub.name, '1X2_DRAW', 'Draw Match', cleanDrawOdds)}
                          disabled={isLive && activeSimulation?.tick ? activeSimulation.tick >= 28 : false}
                          className={`flex flex-col items-center py-2 border rounded-lg transition-all ${
                            isSelected(fixture.id, '1X2_DRAW')
                              ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                          } disabled:opacity-30`}
                        >
                          <span className="text-[8px] opacity-70">X (DRAW)</span>
                          <span className="font-mono text-xs">{cleanDrawOdds}</span>
                        </button>

                        <button
                          id={`odds-away-${fixture.id}`}
                          onClick={() => handleAddSelection(fixture.id, homeClub.name, awayClub.name, '1X2_AWAY', `${awayClub.name} Win`, cleanAwayOdds)}
                          disabled={isLive && activeSimulation?.tick ? activeSimulation.tick >= 28 : false}
                          className={`flex flex-col items-center py-2 border rounded-lg transition-all ${
                            isSelected(fixture.id, '1X2_AWAY')
                              ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                          } disabled:opacity-30`}
                        >
                          <span className="text-[8px] opacity-70">2 ({awayClub.name.substring(0, 3)})</span>
                          <span className="font-mono text-xs">{cleanAwayOdds}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">Over/Under 2.5 Goals</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id={`odds-over-${fixture.id}`}
                          onClick={() => handleAddSelection(fixture.id, homeClub.name, awayClub.name, 'OVER_2.5', 'Over 2.5 Goals', cleanOverOdds)}
                          disabled={isLive && activeSimulation?.tick ? activeSimulation.tick >= 28 : false}
                          className={`flex justify-between items-center px-3 py-1.5 border rounded-lg transition-all ${
                            isSelected(fixture.id, 'OVER_2.5')
                              ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                          } disabled:opacity-30`}
                        >
                          <span className="text-[10px]">Over 2.5</span>
                          <span className="font-mono text-xs">{cleanOverOdds}</span>
                        </button>

                        <button
                          id={`odds-under-${fixture.id}`}
                          onClick={() => handleAddSelection(fixture.id, homeClub.name, awayClub.name, 'UNDER_2.5', 'Under 2.5 Goals', cleanUnderOdds)}
                          disabled={isLive && activeSimulation?.tick ? activeSimulation.tick >= 28 : false}
                          className={`flex justify-between items-center px-3 py-1.5 border rounded-lg transition-all ${
                            isSelected(fixture.id, 'UNDER_2.5')
                              ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                          } disabled:opacity-30`}
                        >
                          <span className="text-[10px]">Under 2.5</span>
                          <span className="font-mono text-xs">{cleanUnderOdds}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#121620] rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[300px] shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Active Betslip ({activeSlip.length})</span>
          </div>
          {activeSlip.length > 1 && (
            <span className="text-[9px] bg-sky-500 text-black px-2 py-0.5 rounded-full font-black animate-pulse">
              ACCUMULATOR MULTI
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
          {activeSlip.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-500">
              <AlertCircle className="w-6 h-6 mb-2 text-slate-600" />
              <p className="text-xs">Your betslip is currently vacant.</p>
              <p className="text-[10px] text-slate-600 mt-1">Select odds values from above to start compiling.</p>
            </div>
          ) : (
            activeSlip.map(sel => (
              <div key={sel.fixtureId} className="bg-white/5 border-l-4 border-emerald-500 p-2.5 rounded-r-lg relative">
                <button
                  onClick={() => handleRemoveSelection(sel.fixtureId)}
                  className="absolute top-2 right-2 p-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex justify-between items-start mb-1 pr-6">
                  <span className="text-[10px] font-bold text-white truncate max-w-[140px]">{sel.homeTeamName} vs {sel.awayTeamName}</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-400/5 px-1 rounded">{sel.odds}</span>
                </div>
                <div className="text-[9px] text-slate-500">Selected Outcome:</div>
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-tighter">{sel.selectedLabel}</div>
              </div>
            ))
          )}
        </div>

        {errorMessage && (
          <div className="mx-4 p-2 bg-red-950/40 border border-red-500/30 rounded text-[10px] text-red-400 flex items-center gap-1.5">
            <X className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-4 bg-black/40 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Custom Stake:</span>
            <div className="flex items-center bg-white/5 rounded-lg border border-white/10 px-2 w-32 relative">
              <span className="text-slate-500 font-mono text-xs mr-1">$</span>
              <input
                id="stake-input"
                type="number"
                min="5"
                max="50000"
                value={stakeAmount}
                onChange={e => setStakeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none py-1.5"
              />
            </div>
          </div>

          <div className="flex justify-between text-[10px] border-t border-white/5 pt-2">
            <span className="text-slate-400 uppercase">Combined Odds</span>
            <span className="font-mono text-white font-bold">{totalOdds}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Potential Return</span>
            <span className="text-lg font-mono font-black text-emerald-400">${potentialPayout.toLocaleString()}</span>
          </div>

          <button
            id="place-bet-button"
            onClick={handlePlaceBet}
            disabled={activeSlip.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Coins className="w-4 h-4" />
            Place {activeSlip.length > 1 ? 'Accumulator Multi' : 'Single Bet'}
          </button>
        </div>
      </div>

      <div className="bg-[#121620] rounded-2xl border border-white/10 p-4 flex flex-col gap-3 min-h-[160px] max-h-[220px] overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          Pending Tickets Tracking
        </h3>

        {pendingTickets.filter(t => t.status === 'PENDING').length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-600">
            No active stakes. Place a ticket first to track cashout ratios.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTickets.filter(t => t.status === 'PENDING').map(ticket => {
              const cashout = ticket.cashoutValue;

              return (
                <div key={ticket.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center text-[9px] font-mono border-b border-white/5 pb-1">
                    <span className="text-slate-400">ID: #{ticket.id.substring(0, 6)}</span>
                    <span className="text-amber-500 font-bold">{ticket.selections.length} Legs Kombi</span>
                  </div>

                  <div className="space-y-1 my-1">
                    {ticket.selections.map((sel, sidx) => (
                      <div key={sidx} className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-300 truncate max-w-[140px]">{sel.homeTeamName} vs {sel.awayTeamName}</span>
                        <span className="text-[9px] bg-white/5 px-1 text-emerald-400 rounded font-bold font-mono">{sel.selectedLabel} @ {sel.odds}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase">STAKE: ${ticket.stake}</div>
                      <div className="text-[9px] text-slate-400 font-bold">POTENTIAL: ${ticket.potentialPayout}</div>
                    </div>
                    
                    <button
                      id={`cashout-btn-${ticket.id}`}
                      onClick={() => onCashoutTicket(ticket.id, cashout)}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[9px] uppercase tracking-wider rounded-lg transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Cashout ${cashout}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
