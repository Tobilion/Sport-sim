import React from "react";
import { Player } from "../types";

export interface MoraleEventModalProps {
  player: Player;
  onDecision: (choice: "start" | "wage" | "train" | "list") => void;
}

export const MoraleEventModal: React.FC<MoraleEventModalProps> = ({
  player,
  onDecision,
}) => {
  const morale = player.morale ?? 50;
  const moraleColor = morale < 25 ? "text-rose-400" : morale < 45 ? "text-amber-400" : "text-yellow-400";

  const reason =
    player.personality === "Ambitious" || player.personality === "Star"
      ? "He feels he deserves more starting minutes and is frustrated with squad rotation."
      : player.personality === "Mercenary"
        ? "He believes his wage no longer reflects his contribution to the squad."
        : player.personality === "Temperamental"
          ? "Recent results have hit him hard. He needs reassurance from the manager."
          : "He is unsettled and questions his place in your long-term plans.";

  const options: { key: "start" | "wage" | "train" | "list"; label: string; desc: string; effect: string }[] = [
    {
      key: "start",
      label: "Guarantee him a start",
      desc: "Promise him a place in the next XI regardless of form.",
      effect: "Morale +15 · Forces next selection",
    },
    {
      key: "wage",
      label: "Offer contract improvement",
      desc: "Boost his weekly wage to show he is valued.",
      effect: "Morale +20 · Wage +$2,000/wk",
    },
    {
      key: "train",
      label: "Tell him to work harder",
      desc: "Hold firm — performance earns starts, not demands.",
      effect: "Morale −5 now · +5 after 3 weeks if he starts",
    },
    {
      key: "list",
      label: "List him for transfer",
      desc: "Make it clear he has a future elsewhere if unhappy.",
      effect: "Morale stabilises at 45 · Opens transfer window",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-amber-500/30 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <h2 className="text-base font-black text-white">Player Unrest</h2>
              <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Locker Room Alert</p>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-xl font-black font-mono ${moraleColor}`}>{morale}</div>
              <div className="text-[8px] text-slate-500 font-mono">MORALE</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                player.position === "GK" ? "bg-orange-500/20 text-orange-400"
                : player.position === "DEF" ? "bg-sky-500/20 text-sky-400"
                : player.position === "MID" ? "bg-emerald-500/20 text-emerald-400"
                : "bg-rose-500/20 text-rose-400"
              }`}>{player.position}</span>
              <span className="font-bold text-white">{player.name}</span>
              <span className="text-[9px] text-slate-500 font-mono ml-auto">{player.age}y · {player.nationality}</span>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{reason}"
            </p>
            {player.personality && (
              <span className="mt-1.5 inline-block text-[8px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded font-bold uppercase">
                {player.personality}
              </span>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => onDecision(opt.key)}
              className="w-full text-left bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-sky-500/30 rounded-xl p-3 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                    {opt.label}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
                <span className="text-[8px] font-mono text-slate-500 shrink-0 text-right mt-0.5 leading-tight">{opt.effect}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
