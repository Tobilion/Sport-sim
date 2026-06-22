import React, { useState } from "react";
import { Player } from "../types";

export interface PlayerDossierModalProps {
  player: Player;
  isOwnTeam?: boolean;
  onClose: () => void;
}

export const PlayerDossierModal: React.FC<PlayerDossierModalProps> = ({
  player,
  isOwnTeam = false,
  onClose,
}) => {
  const [dossierTypeTab, setDossierTypeTab] = useState<"STATS" | "QUALITIES">(
    "STATS",
  );

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#121620] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header layout */}
        <div className="p-5 border-b border-white/5 relative bg-gradient-to-r from-sky-500/10 to-transparent">
          <span
            className={`absolute top-4 right-4 px-2 py-0.5 rounded font-mono font-black text-[9px] uppercase tracking-wider ${
              player.position === "GK"
                ? "bg-orange-500/20 text-orange-400"
                : player.position === "DEF"
                  ? "bg-sky-500/20 text-sky-400"
                  : player.position === "MID"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {player.position} Role
          </span>

          <h2 className="text-lg font-black text-white">{player.name}</h2>
          <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">
            Player Profile Registry Dossier System
          </p>
        </div>

        {/* Dossier Tabs */}
        <div className="flex bg-slate-900 border-b border-white/5">
          <button
            onClick={() => setDossierTypeTab("STATS")}
            className={`flex-1 py-2 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all cursor-pointer ${
              dossierTypeTab === "STATS"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Season Metrics Stats
          </button>
          <button
            onClick={() => setDossierTypeTab("QUALITIES")}
            className={`flex-1 py-2 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all cursor-pointer ${
              dossierTypeTab === "QUALITIES"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Technical Qualities
          </button>
        </div>

        {/* Dossier Tab Content */}
        <div className="p-5 space-y-4">
          {dossierTypeTab === "STATS" ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Biological Age:</span>
                <strong className="text-sky-400 text-sm bg-slate-800/80 px-2.5 py-0.5 rounded border border-white/5">
                  {player.age || 24} Years Old
                </strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">
                  Global OVR Quality index:
                </span>
                <strong className="text-white text-sm bg-slate-800 px-2 py-0.5 rounded">
                  {player.rating} Rating
                </strong>
              </div>
              {isOwnTeam && (
                <div className="py-2 border-b border-white/5 space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Training Progression</span>
                    <span className="text-emerald-400 font-mono">
                      {player.trainingProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 shadow-inner h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${player.trainingProgress || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-slate-500 italic mt-1 leading-tight">
                    Facility levels & recent match ratings drive weekly
                    progression points. Reach 100% to boost overall rating +1.
                  </div>
                </div>
              )}
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">League Goals Scored:</span>
                <strong className="text-emerald-400 text-sm">
                  {player.goals} G
                </strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Tournament Goals Scored:</span>
                <strong className="text-amber-400 text-sm">
                  {player.tournamentGoals || 0} G
                </strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Assists Contributed:</span>
                <strong className="text-sky-455 text-sm">
                  {(player.assists || 0) + (player.tournamentAssists || 0)} A
                </strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">
                  Yellow / Red Card Warnings:
                </span>
                <span className="flex items-center gap-1.5 text-slate-200 font-extrabold">
                  <span className="bg-amber-400 w-3 h-4 rounded-sm inline-block"></span>{" "}
                  {(player.yellowCards || 0) +
                    (player.tournamentYellowCards || 0)}
                  <span className="bg-red-500 w-3 h-4 rounded-sm inline-block"></span>{" "}
                  {(player.redCards || 0) + (player.tournamentRedCards || 0)}
                </span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Stamina Conditioning:</span>
                <strong className="text-[#22c55e]">
                  {Math.round(player.stamina)}% Fit
                </strong>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              {Object.entries(player.attributes || {}).map(([key, value]) => {
                const numericValue = Number(value);
                const potOffset = (player.potentialRating || 90) - player.rating;
                const potentialValue = Math.min(99, numericValue + potOffset);
                const letterGrade = numericValue >= 90 ? "S" : numericValue >= 80 ? "A" : numericValue >= 70 ? "B" : numericValue >= 60 ? "C" : numericValue >= 50 ? "D" : "E";
                const letterColor = numericValue >= 90 ? "text-amber-400" : numericValue >= 80 ? "text-emerald-400" : numericValue >= 70 ? "text-teal-400" : numericValue >= 60 ? "text-slate-300" : numericValue >= 50 ? "text-yellow-500" : "text-rose-500";
                
                return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-end text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-[3px] bg-slate-800 border border-white/10 ${letterColor} text-[8px]`}>
                        {letterGrade}
                      </span>
                      {key}
                    </span>
                    <span className="text-white">
                      {value} <span className="text-slate-600 font-normal">/ {potentialValue} POT</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 border border-white/5 h-2 rounded-md overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-amber-500/30"
                      style={{ width: `${potentialValue}%` }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 h-full bg-teal-500 rounded-r-md shadow-[0_0_8px_rgba(20,184,166,0.6)]"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-white/5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all cursor-pointer"
          >
            Close Profile Folder
          </button>
        </div>
      </div>
    </div>
  );
};
