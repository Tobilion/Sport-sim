import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import type { Club, LiveMatchSimulation } from '../../types';
import { runAssistantSubstitution } from '../../engine/matchEngine';

interface Props {
  activeSimulation: LiveMatchSimulation;
  allClubs: Club[];
  onClose: () => void;
  onResume: () => void;
  onMessage: (msg: string) => void;
}

export function HalftimeModal({ activeSimulation, allClubs, onClose, onResume, onMessage }: Props) {
  const handleAssistantSubs = () => {
    const h = allClubs.find(c => c.id === activeSimulation.homeClubId);
    if (h) runAssistantSubstitution(h);
    onClose();
    onResume();
    onMessage('Halftime substitutions deployed successfully! Commencing 2nd half.');
    setTimeout(() => onMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn text-left">
      <div className="bg-[#121620] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex justify-between items-center">
          <div>
            <h2 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse animate-bounce" />
              HALFTIME TEAM TALK & SUBSTITUTIONS
            </h2>
            <p className="text-[9px] text-slate-450 font-mono uppercase mt-0.5">Tactical briefing panel</p>
          </div>
          <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-center font-mono text-xs">
            Score: <strong className="text-white font-black">{activeSimulation.homeScore} - {activeSimulation.awayScore}</strong>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
          <div className="space-y-3.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono font-bold">Your Locker Room Strategy:</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              The referee has blown the whistle. Your starting players are fatigued from 45 minutes of heavy play. Pick tactical substitutes or utilize your head coach guidelines.
            </p>
          </div>
          <div className="bg-[#1c2230] border border-white/5 p-4 rounded-xl space-y-3">
            <span className="text-[10px] text-[#f59e0b] block uppercase tracking-wider font-extrabold flex items-center gap-1">
              <Activity className="w-4 h-4 text-amber-500" /> Half-Time Quick Substitution Notice
            </span>
            <p className="text-[11.5px] text-slate-400 leading-normal">
              Click below to have the assistant coach dynamically rotate tired players automatically for the 2nd half.
            </p>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border-t border-white/5 flex flex-col md:flex-row gap-3">
          <button onClick={handleAssistantSubs} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center">
            Let Assistant Deploy Subs & Play
          </button>
          <button onClick={() => { onClose(); onResume(); }} className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-white border border-white/10 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center">
            Continue Play without Adjustments
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center">
            Make Subs Myself (Live Tactics)
          </button>
        </div>
      </div>
    </div>
  );
}
