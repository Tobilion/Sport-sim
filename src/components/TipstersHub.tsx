import React, { useState } from 'react';
import { Users, Flame, Percent, Wallet, Copy, Crown, Check, AlertCircle } from 'lucide-react';
import { Tipster, BetSelection } from '../types';

interface TipstersHubProps {
  userBalance: number;
  onSubscribeTipster: (tipsterId: string, fee: number) => void;
  onCopyTicket: (ticket: BetSelection[]) => void;
  allTipsters: Tipster[];
}

export const TipstersHub: React.FC<TipstersHubProps> = ({
  userBalance,
  onSubscribeTipster,
  onCopyTicket,
  allTipsters
}) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const buySubscription = (tipster: Tipster) => {
    if (tipster.isSubscribed) return;
    if (userBalance < tipster.subPrice) {
      setErrorMessage(`Insufficient virtual balance of $${tipster.subPrice} for subscription entry!`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    onSubscribeTipster(tipster.id, tipster.subPrice);
    setSuccessMessage(`Successfully subscribed to ${tipster.name}'s premium feed!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCopySelections = (tipster: Tipster) => {
    if (!tipster.isSubscribed) {
      setErrorMessage(`You must subscribe to unlock ${tipster.name}'s weekly selections compilation!`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    onCopyTicket(tipster.weeklyTicket);
    setSuccessMessage(`Copied ${tipster.name}'s ticket bundle directly into your Active Betslip compiler!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="bg-gradient-to-r from-[#121620] to-[#0c0f16] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Virtual Tipsters Guild Forum
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scout premium slips designed by expert football analytical bots. Pay small fee, copy combo tickets, and skyrocket your ROI!
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 font-bold uppercase font-mono">YOUR BAL:</span>
          <span className="text-emerald-400 font-mono font-black">${userBalance.toLocaleString()}</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-400 flex items-center gap-1.5 font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-400 flex items-center gap-2 font-bold animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allTipsters.map(tp => (
          <div key={tp.id} className="bg-[#121620] border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden">
            {tp.winStreak >= 6 && (
              <div className="absolute -top-[1px] right-4 bg-gradient-to-r from-red-500 to-amber-500 text-black font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-b-md flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3 text-black animate-bounce" />
                HOT STREAK
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-3.5 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-500 overflow-hidden flex items-center justify-center font-black text-black text-sm uppercase shadow-inner" style={{ color: '#000000', backgroundColor: '#e2e8f0' }}>
                  {tp.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white hover:text-amber-400 transition-colors cursor-pointer">{tp.name}</h3>
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                    {tp.speciality}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 rounded-xl p-3 text-center font-mono">
                <div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest">Bot ROI</div>
                  <div className="text-sm font-black text-emerald-400 mt-1 flex items-center justify-center gap-0.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {tp.roi}%
                  </div>
                </div>
                <div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest">Active Streak</div>
                  <div className="text-sm font-black text-amber-400 mt-1 flex items-center justify-center gap-1 font-bold">
                    L{tp.winStreak}
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                </div>
                <div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest">Subs Guild</div>
                  <div className="text-sm font-black text-white mt-1">
                    {tp.subscribers.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2 relative">
                <h4 className="text-[10px] uppercase text-slate-400 tracking-wider font-bold border-b border-white/5 pb-1 flex justify-between items-center">
                  <span>Weekly Ticket compilation Bundle</span>
                  <span className="text-amber-500 font-mono text-[9px] font-bold">Total Odds: {tp.weeklyTicketOdds}</span>
                </h4>

                {tp.isSubscribed ? (
                  <div className="space-y-1.5 pt-1">
                    {tp.weeklyTicket.map((sel, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] text-slate-300">
                        <span className="truncate max-w-[170px] font-bold">{sel.homeTeamName} vs {sel.awayTeamName}</span>
                        <span className="text-[9px] px-1.5 font-bold font-mono text-emerald-400 bg-emerald-400/5 rounded">
                          {sel.selectedLabel} @ {sel.odds}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <div className="text-xs font-bold text-slate-400">Premium Locked Content 🔒</div>
                    <div className="text-[10px] text-slate-600 mt-1">Pay the subscription entry token below to access full card.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-white/5 pt-4 flex gap-3">
              {!tp.isSubscribed ? (
                <button
                  id={`sub-tipster-${tp.id}`}
                  onClick={() => buySubscription(tp)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                >
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  Subscribe for ${tp.subPrice}
                </button>
              ) : (
                <div className="flex-1 text-center py-2 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-bold uppercase tracking-wide rounded-xl text-[10px] flex items-center justify-center gap-1 select-none">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Privileged Premium Subscriber
                </div>
              )}

              <button
                id={`copy-tipster-ticket-${tp.id}`}
                onClick={() => handleCopySelections(tp)}
                disabled={!tp.isSubscribed}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
              >
                <Copy className="w-3.5 h-3.5 shrink-0" />
                Copy Slip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
