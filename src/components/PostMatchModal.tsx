import React, { useState } from 'react';
import { X, Star, Target, Zap, Trophy, TrendingUp, Clock } from 'lucide-react';
import { PostMatchAnalysis, Club } from '../types';

interface PostMatchModalProps {
  analysis: PostMatchAnalysis;
  homeClub: Club;
  awayClub: Club;
  onClose: () => void;
}

const getRatingColor = (r: number): string => {
  if (r >= 8.0) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  if (r >= 7.0) return 'text-sky-400 bg-sky-500/15 border-sky-500/30';
  if (r >= 6.0) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  if (r >= 5.0) return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
  return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
};

const StatBar: React.FC<{ label: string; home: number; away: number; homeColor: string; awayColor: string }> = ({ label, home, away, homeColor, awayColor }) => {
  const total = (home + away) || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="font-black text-white">{home}</span>
        <span>{label}</span>
        <span className="font-black text-white">{away}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
        <div className="transition-all duration-700" style={{ width: `${homePct}%`, backgroundColor: homeColor }} />
        <div className="transition-all duration-700" style={{ width: `${awayPct}%`, backgroundColor: awayColor }} />
      </div>
    </div>
  );
};

export const PostMatchModal: React.FC<PostMatchModalProps> = ({ analysis, homeClub, awayClub, onClose }) => {
  const [tab, setTab] = useState<'overview' | 'ratings' | 'goals' | 'stats'>('overview');

  const getPlayerById = (id: string) => {
    const p1 = homeClub.squad.find(p => p.id === id);
    if (p1) return { player: p1, club: homeClub };
    const p2 = awayClub.squad.find(p => p.id === id);
    if (p2) return { player: p2, club: awayClub };
    return null;
  };

  const motmData = analysis.motm ? getPlayerById(analysis.motm) : null;

  // All starting players for ratings tab
  const homeStarters = homeClub.squad.filter(p => p.isStarting && analysis.playerRatings[p.id] !== undefined);
  const awayStarters = awayClub.squad.filter(p => p.isStarting && analysis.playerRatings[p.id] !== undefined);
  const allRatedPlayers = [...homeStarters.map(p => ({ p, club: homeClub })), ...awayStarters.map(p => ({ p, club: awayClub }))];
  allRatedPlayers.sort((a, b) => (analysis.playerRatings[b.p.id] || 0) - (analysis.playerRatings[a.p.id] || 0));

  const homeUserStarters = homeStarters.sort((a, b) => (analysis.playerRatings[b.id] || 0) - (analysis.playerRatings[a.id] || 0));

  const isWin = analysis.homeScore > analysis.awayScore;
  const isDraw = analysis.homeScore === analysis.awayScore;

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'ratings' as const, label: 'Ratings' },
    { id: 'goals' as const, label: 'Goals' },
    { id: 'stats' as const, label: 'Stats' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#0d1117] border border-white/10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Score Header */}
        <div className="relative p-5 text-center shrink-0" style={{ background: `linear-gradient(135deg, ${homeClub.color}20, ${awayClub.color}20)` }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all">
            <X className="w-4 h-4 text-white" />
          </button>
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-3">Full Time</p>
          <div className="flex items-center justify-center gap-5">
            <div className="text-right">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mx-auto mb-1 border border-white/15"
                style={{ backgroundColor: `${homeClub.color}30`, color: homeClub.color }}>
                {homeClub.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-[10px] text-slate-400 font-bold">{homeClub.name}</p>
            </div>
            <div className="text-center px-3 sm:px-4 py-2 bg-white/5 rounded-2xl border border-white/10 min-w-[60px] sm:min-w-[80px]">
              <p className="text-3xl font-black text-white tracking-tight">
                {analysis.homeScore} — {analysis.awayScore}
              </p>
              <p className={`text-[9px] font-bold uppercase mt-1 ${isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-rose-400'}`}>
                {isWin ? 'Home Win' : isDraw ? 'Draw' : 'Away Win'}
              </p>
            </div>
            <div className="text-left">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mx-auto mb-1 border border-white/15"
                style={{ backgroundColor: `${awayClub.color}30`, color: awayClub.color }}>
                {awayClub.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-[10px] text-slate-400 font-bold">{awayClub.name}</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/10 shrink-0 overflow-x-auto scrollbar-none">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[60px] py-3 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                tab === t.id ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {tab === 'overview' && (
            <>
              {/* Highlights text */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Match Highlights
                </p>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{analysis.highlightsText}"</p>
              </div>

              {/* MOTM */}
              {motmData && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Man of the Match
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-black text-sm">{motmData.player.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{motmData.club.name} · {motmData.player.position}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border ${getRatingColor(analysis.playerRatings[motmData.player.id] || 0)}`}>
                      {(analysis.playerRatings[motmData.player.id] || 0).toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Shots', home: analysis.homeShots, away: analysis.awayShots },
                  { label: 'On Target', home: analysis.homeShotsOnTarget, away: analysis.awayShotsOnTarget },
                  { label: 'Fouls', home: analysis.homeFouls, away: analysis.awayFouls },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-white font-black text-sm">{s.home} — {s.away}</p>
                  </div>
                ))}
              </div>

              {/* Possession bar */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="font-black text-white">{analysis.homePossession}%</span>
                  <span>Possession</span>
                  <span className="font-black text-white">{analysis.awayPossession}%</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                  <div className="transition-all duration-700 rounded-l-full" style={{ width: `${analysis.homePossession}%`, backgroundColor: homeClub.color }} />
                  <div className="transition-all duration-700 rounded-r-full" style={{ width: `${analysis.awayPossession}%`, backgroundColor: awayClub.color }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                  <span>{homeClub.name}</span>
                  <span>{awayClub.name}</span>
                </div>
              </div>
            </>
          )}

          {tab === 'ratings' && (
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-3">All Players — Sorted by Rating</p>
              {allRatedPlayers.map(({ p, club }) => {
                const r = analysis.playerRatings[p.id] || 6.0;
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: club.color }} />
                    <span className="flex-1 text-xs font-semibold text-slate-200 truncate">{p.name}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold shrink-0">{p.position}</span>
                    <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-xs font-black border ${getRatingColor(r)}`}>
                      {r.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'goals' && (
            <div className="space-y-3">
              {analysis.goalReplays.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">No goals scored</div>
              ) : (
                analysis.goalReplays.map((gr, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30">
                        <Target className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">{gr.scorer}</p>
                        <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {gr.minute}'
                          {gr.assister && <span className="text-slate-400"> · Assist: {gr.assister}</span>}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{gr.description}"</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'stats' && (
            <div className="space-y-3">
              <StatBar label="Shots" home={analysis.homeShots} away={analysis.awayShots} homeColor={homeClub.color} awayColor={awayClub.color} />
              <StatBar label="On Target" home={analysis.homeShotsOnTarget} away={analysis.awayShotsOnTarget} homeColor={homeClub.color} awayColor={awayClub.color} />
              <StatBar label="Possession %" home={analysis.homePossession} away={analysis.awayPossession} homeColor={homeClub.color} awayColor={awayClub.color} />
              <StatBar label="Fouls" home={analysis.homeFouls} away={analysis.awayFouls} homeColor={homeClub.color} awayColor={awayClub.color} />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider pt-1">
                <span>{homeClub.name}</span>
                <span className="opacity-0">Stats</span>
                <span>{awayClub.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 shrink-0 border-t border-white/10">
          <button onClick={onClose} className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-wider text-xs rounded-2xl transition-all cursor-pointer">
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};
