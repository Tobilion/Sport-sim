import React from 'react';
import { X } from 'lucide-react';
import { Player } from '../types';

interface PlayerCompareModalProps {
  playerA: Player;
  playerB: Player;
  onClose: () => void;
}

const ATTRS: { key: keyof Player['attributes']; label: string }[] = [
  { key: 'pace', label: 'Pace' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defending', label: 'Defending' },
  { key: 'physical', label: 'Physical' },
];

const avgRating = (p: Player): number =>
  Math.round(Object.values(p.attributes).reduce((a, b) => a + b, 0) / 6);

export const PlayerCompareModal: React.FC<PlayerCompareModalProps> = ({ playerA, playerB, onClose }) => {
  const ovrA = playerA.rating;
  const ovrB = playerB.rating;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#0d1117] border border-white/10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-black text-white uppercase tracking-tight">Player Comparison</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Player headers */}
          <div className="grid grid-cols-2 gap-3">
            {[playerA, playerB].map((p, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto mb-2 text-sky-400 font-black text-lg">
                  {p.name.charAt(0)}
                </div>
                <p className="text-white font-black text-sm leading-tight">{p.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">{p.position} · Age {p.age}</p>
                <div className="mt-2 inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 rounded-lg px-2 py-1">
                  <span className="text-sky-400 font-black text-sm">{p.rating}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">OVR</span>
                </div>
              </div>
            ))}
          </div>

          {/* Attribute bars */}
          <div className="space-y-3">
            {ATTRS.map(({ key, label }) => {
              const vA = playerA.attributes[key];
              const vB = playerB.attributes[key];
              const max = Math.max(vA, vB, 1);
              const aWins = vA > vB;
              const bWins = vB > vA;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black w-8 text-right ${aWins ? 'text-emerald-400' : 'text-slate-400'}`}>{vA}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex-1 text-center">{label}</span>
                    <span className={`text-xs font-black w-8 text-left ${bWins ? 'text-emerald-400' : 'text-slate-400'}`}>{vB}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-white/5 gap-0.5">
                    {/* Left bar (A) */}
                    <div className="flex-1 flex justify-end">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${aWins ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        style={{ width: `${(vA / max) * 100}%` }}
                      />
                    </div>
                    <div className="w-px bg-white/10 shrink-0" />
                    {/* Right bar (B) */}
                    <div className="flex-1 flex justify-start">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${bWins ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        style={{ width: `${(vB / max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verdict */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-2">Verdict</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ovrA > ovrB
                ? `${playerA.name} (OVR ${ovrA}) is overall stronger than ${playerB.name} (OVR ${ovrB}).`
                : ovrB > ovrA
                ? `${playerB.name} (OVR ${ovrB}) is overall stronger than ${playerA.name} (OVR ${ovrA}).`
                : `${playerA.name} and ${playerB.name} are evenly matched at OVR ${ovrA}.`}
              {playerA.position !== playerB.position
                ? ` Note: they play different positions (${playerA.position} vs ${playerB.position}).`
                : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
