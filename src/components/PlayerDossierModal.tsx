import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerDossierModalProps {
  player: Player;
  onClose: () => void;
}

export const PlayerDossierModal: React.FC<PlayerDossierModalProps> = ({ player, onClose }) => {
  const [dossierTypeTab, setDossierTypeTab] = useState<'STATS' | 'QUALITIES'>('STATS');

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-[#121620] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
        
        {/* Header layout */}
        <div className="p-5 border-b border-white/5 relative bg-gradient-to-r from-sky-500/10 to-transparent">
          <span className={`absolute top-4 right-4 px-2 py-0.5 rounded font-mono font-black text-[9px] uppercase tracking-wider ${
            player.position === 'GK' ? 'bg-orange-500/20 text-orange-400' :
            player.position === 'DEF' ? 'bg-sky-500/20 text-sky-400' :
            player.position === 'MID' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-rose-500/20 text-rose-400'
          }`}>
            {player.position} Role
          </span>

          <h2 className="text-lg font-black text-white">{player.name}</h2>
          <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">Player Profile Registry Dossier System</p>
        </div>

        {/* Dossier Tabs */}
        <div className="flex bg-slate-900 border-b border-white/5">
          <button
            onClick={() => setDossierTypeTab('STATS')}
            className={`flex-1 py-2 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all cursor-pointer ${
              dossierTypeTab === 'STATS' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Season Metrics Stats
          </button>
          <button
            onClick={() => setDossierTypeTab('QUALITIES')}
            className={`flex-1 py-2 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all cursor-pointer ${
              dossierTypeTab === 'QUALITIES' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Technical Qualities
          </button>
        </div>

        {/* Dossier Tab Content */}
        <div className="p-5 space-y-4">
          {dossierTypeTab === 'STATS' ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Global OVR Quality index:</span>
                <strong className="text-white text-sm bg-slate-800 px-2 py-0.5 rounded">{player.rating} Rating</strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">League Goals Scored:</span>
                <strong className="text-emerald-400 text-sm">{player.goals} G</strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Tournament Goals Scored:</span>
                <strong className="text-amber-400 text-sm">{player.tournamentGoals || 0} G</strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Assists Contributed:</span>
                <strong className="text-sky-455 text-sm">{(player.assists || 0) + (player.tournamentAssists || 0)} A</strong>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Yellow / Red Card Warnings:</span>
                <span className="flex items-center gap-1.5 text-slate-200 font-extrabold">
                  <span className="bg-amber-400 w-3 h-4 rounded-sm inline-block"></span> {(player.yellowCards || 0) + (player.tournamentYellowCards || 0)}
                  <span className="bg-red-500 w-3 h-4 rounded-sm inline-block"></span> {(player.redCards || 0) + (player.tournamentRedCards || 0)}
                </span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-white/5">
                <span className="text-slate-500">Stamina Conditioning:</span>
                <strong className="text-[#22c55e]">{Math.round(player.stamina)}% Fit</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs font-mono">
              {Object.entries(player.attributes || {}).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-[11px] mb-1 capitalize text-slate-400">
                    <span>{key} index rating:</span>
                    <span className="text-white font-extrabold">{value}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              ))}
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
