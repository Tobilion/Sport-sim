import React, { useState } from "react";
import { Player } from "../types";

export interface PlayerDossierModalProps {
  player: Player;
  isOwnTeam?: boolean;
  onClose: () => void;
}

const ATTR_LABELS: Record<string, string> = {
  pace: "Pace",
  shooting: "Shooting",
  passing: "Passing",
  dribbling: "Dribbling",
  defending: "Defending",
  physical: "Physical",
};

export const PlayerDossierModal: React.FC<PlayerDossierModalProps> = ({
  player,
  isOwnTeam = false,
  onClose,
}) => {
  const [tab, setTab] = useState<"STATS" | "ATTRIBUTES" | "GROWTH">("STATS");

  const potentialRating = player.potentialRating ?? Math.min(99, player.rating + 8);
  const avgMatchRating =
    player.matchRatings && player.matchRatings.length > 0
      ? (player.matchRatings.reduce((s, r) => s + r, 0) / player.matchRatings.length).toFixed(1)
      : "N/A";

  const posColor =
    player.position === "GK"
      ? { text: "text-orange-400", bg: "bg-orange-500/20" }
      : player.position === "DEF"
        ? { text: "text-sky-400", bg: "bg-sky-500/20" }
        : player.position === "MID"
          ? { text: "text-emerald-400", bg: "bg-emerald-500/20" }
          : { text: "text-rose-400", bg: "bg-rose-500/20" };

  const moraleColor =
    (player.morale || 70) >= 80 ? "text-emerald-400" : (player.morale || 70) >= 55 ? "text-amber-400" : "text-rose-400";

  const agePhase =
    player.age < 20 ? "🌱 Prospect"
    : player.age < 24 ? "⚡ Rising Star"
    : player.age < 28 ? "🔥 Prime"
    : player.age < 32 ? "🧭 Veteran"
    : "📉 Twilight";

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-sky-500/8 via-transparent to-transparent relative">
          <div className="flex items-start gap-4">
            {/* Avatar circle */}
            <div className={`w-14 h-14 rounded-xl ${posColor.bg} border border-white/10 flex items-center justify-center shrink-0`}>
              <span className={`text-2xl font-black ${posColor.text}`}>
                {player.position === "GK" ? "🧤" : player.position === "DEF" ? "🛡" : player.position === "MID" ? "⚙️" : "⚽"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white truncate">{player.name}</h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${posColor.bg} ${posColor.text}`}>
                  {player.position}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {player.nationality || "Unknown"} • {agePhase}
                </span>
                {player.personality && (
                  <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    {player.personality}
                  </span>
                )}
                {player.injuryWeeksRemaining && player.injuryWeeksRemaining > 0 && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold animate-pulse">
                    🏥 Injured {player.injuryWeeksRemaining}wk
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-white font-mono">{player.rating}</div>
              <div className="text-[9px] text-slate-400 uppercase font-mono">OVR</div>
              <div className="text-xs font-bold text-sky-400 font-mono mt-0.5">{potentialRating} POT</div>
            </div>
          </div>

          {/* OVR → Potential bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Overall → Potential</span>
              <span className="text-sky-400">{player.rating} → {potentialRating}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 relative">
              <div className="absolute top-0 left-0 h-full bg-sky-500/25 rounded-full" style={{ width: `${potentialRating}%` }} />
              <div className="absolute top-0 left-0 h-full bg-sky-500 rounded-full" style={{ width: `${player.rating}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-slate-900/60">
          {(["STATS", "ATTRIBUTES", "GROWTH"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider border-b-2 transition-all cursor-pointer ${
                tab === t ? "border-sky-500 text-sky-400" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "STATS" ? "Season Stats" : t === "ATTRIBUTES" ? "Attributes" : "Growth Log"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[55vh] overflow-y-auto space-y-3 text-xs">
          {tab === "STATS" && (
            <div className="space-y-2">
              {[
                { label: "Age", value: `${player.age} yrs ${player.age < 23 ? "🟢" : player.age > 30 ? "🔴" : "🟡"}` },
                { label: "Appearances", value: `${player.appearances || 0}` },
                { label: "Average Rating", value: avgMatchRating !== "N/A" ? `${avgMatchRating} ⭐` : "No matches" },
                { label: "League Goals", value: `${player.goals} ⚽` },
                { label: "Cup Goals", value: `${player.tournamentGoals || 0} 🏆` },
                { label: "Assists (all)", value: `${(player.assists || 0) + (player.tournamentAssists || 0)} 🎯` },
                ...(player.position === "GK" ? [
                  { label: "League Saves", value: `${player.saves || 0} 🧤` },
                  { label: "Cup Saves", value: `${player.tournamentSaves || 0} 🏆` },
                ] : []),
                { label: "Yellow Cards", value: `${(player.yellowCards || 0) + (player.tournamentYellowCards || 0)} 🟨` },
                { label: "Red Cards", value: `${(player.redCards || 0) + (player.tournamentRedCards || 0)} 🟥` },
                { label: "Stamina", value: `${Math.round(player.stamina || 100)}%` },
                { label: "Morale", value: `${player.morale || 75}%` },
                { label: "Fatigue", value: `${player.fatigue ?? 100}%` },
                { label: "Market Value", value: `$${((player.marketValue || 0) / 1000000).toFixed(2)}M` },
                ...(player.injuryType ? [{ label: "Injury", value: `${player.injuryType} (${player.injuryWeeksRemaining}wk)` }] : []),
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5 font-mono">
                  <span className="text-slate-500">{row.label}</span>
                  <strong className="text-slate-200">{row.value}</strong>
                </div>
              ))}
              {/* Morale bar */}
              <div className="pt-2">
                <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                  <span>Morale</span>
                  <span className={moraleColor}>{player.morale || 75}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(player.morale || 75) >= 80 ? "bg-emerald-500" : (player.morale || 75) >= 55 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${player.morale || 75}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "ATTRIBUTES" && (
            <div className="space-y-3">
              {Object.entries(player.attributes || {}).map(([key, value]) => {
                const numVal = Number(value);
                const potOffset = potentialRating - player.rating;
                const potVal = Math.min(99, numVal + potOffset);
                const grade = numVal >= 90 ? "S" : numVal >= 80 ? "A" : numVal >= 70 ? "B" : numVal >= 60 ? "C" : numVal >= 50 ? "D" : "E";
                const gradeColor = numVal >= 90 ? "text-amber-400" : numVal >= 80 ? "text-emerald-400" : numVal >= 70 ? "text-teal-400" : numVal >= 60 ? "text-slate-300" : "text-rose-400";
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className={`w-4 h-4 flex items-center justify-center rounded bg-slate-800 border border-white/10 ${gradeColor} text-[8px]`}>{grade}</span>
                        {ATTR_LABELS[key] || key}
                      </span>
                      <span className="font-mono text-white">
                        {numVal} <span className="text-slate-600">/ {potVal} POT</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 border border-white/5 h-2 rounded-md overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-sky-500/20" style={{ width: `${potVal}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-sky-500 rounded-r-sm" style={{ width: `${numVal}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "GROWTH" && (
            <div className="space-y-3">
              {isOwnTeam && (
                <div className="bg-emerald-950/30 border border-emerald-500/15 rounded-xl p-3 mb-3">
                  <div className="text-[9px] text-emerald-400 uppercase font-mono tracking-wider mb-1">Training Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${player.trainingProgress || 0}%` }} />
                    </div>
                    <span className="text-emerald-400 font-mono font-black text-xs">{player.trainingProgress || 0}%</span>
                  </div>
                </div>
              )}
              {player.developmentLog && player.developmentLog.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Last {Math.min(10, player.developmentLog.length)} Week Growth History</div>
                  {[...player.developmentLog].slice(-10).reverse().map((log, i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 rounded-lg p-2.5">
                      <div className="text-[9px] text-slate-500 font-mono uppercase mb-1.5">Week {log.week}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(log.changes).map(([attr, delta]) => (
                          <span
                            key={attr}
                            className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                              delta > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {attr.toUpperCase()} {delta > 0 ? "+" : ""}{delta}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 italic text-xs font-mono">
                  No development history recorded yet.
                </div>
              )}
              <div className="mt-2 pt-3 border-t border-white/5">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono mb-2">Career Snapshot</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Starting OVR", value: Math.max(30, player.rating - (player.developmentLog?.reduce((s, l) => s + (l.changes['OVR'] || 0), 0) ?? 0)) },
                    { label: "Current OVR", value: player.rating },
                    { label: "Potential", value: potentialRating },
                  ].map(c => (
                    <div key={c.label} className="bg-slate-900/60 border border-white/5 rounded-lg p-2 text-center">
                      <div className="text-[8px] text-slate-500 uppercase font-mono">{c.label}</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5">{c.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/40">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
