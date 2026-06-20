import React, { useState } from 'react';
import { Club, Fixture } from '../types';
import { Calendar, History, Trophy, Users } from 'lucide-react';

interface ClubDossierModalProps {
  club: Club;
  leagueFixtures: Fixture[];
  tournamentFixtures: Fixture[];
  onClose: () => void;
  onOpenPlayerDossier: (playerId: string) => void;
}

export const ClubDossierModal: React.FC<ClubDossierModalProps> = ({ club, leagueFixtures, tournamentFixtures, onClose, onOpenPlayerDossier }) => {
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MATCHES' | 'HISTORY'>('ROSTER');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Compute past results
  const allFixtures = [...leagueFixtures, ...tournamentFixtures];
  const clubFixtures = allFixtures.filter(f => f.homeClubId === club.id || f.awayClubId === club.id).filter(f => f.isCompleted).sort((a, b) => b.week - a.week);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-[#121620] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative text-left" onClick={e => e.stopPropagation()}>
        
        {/* Header info */}
        <div className="p-5 border-b border-white/5 relative bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(135deg, ${club.color}35, transparent)` }}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                <span className="w-4 h-4 rounded-full inline-block shadow border border-white/10" style={{ backgroundColor: club.color }}></span>
                {club.name}
              </h2>
              <p className="text-[10px] font-mono text-slate-400 uppercase mt-1">Club Management & Analytical Extranet Registry</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Global OVR</span>
              <strong className="text-2xl font-black text-white">
                {Math.round(club.squad.reduce((s, p) => s + p.rating, 0) / club.squad.length)}
              </strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900 border-b border-white/5">
          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`flex-1 flex gap-2 justify-center py-2.5 text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeTab === 'ROSTER' ? 'border-b-2 border-sky-500 text-sky-400' : 'border-b-2 border-transparent text-slate-400 hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Tactical Roster
          </button>
          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`flex-1 flex gap-2 justify-center py-2.5 text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeTab === 'MATCHES' ? 'border-b-2 border-amber-500 text-amber-400' : 'border-b-2 border-transparent text-slate-400 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Match Logs
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 flex gap-2 justify-center py-2.5 text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeTab === 'HISTORY' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'border-b-2 border-transparent text-slate-400 hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Standing Record
          </button>
        </div>

        <div className="p-5 max-h-[400px] overflow-y-auto">
          {activeTab === 'ROSTER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                <div className="bg-[#1c2230] p-3 rounded-xl border border-white/5">
                  <span className="text-slate-500 font-bold block uppercase text-[8px] font-mono mb-1">Assigned Head Coach</span>
                  <span className="text-white font-extrabold block text-sm">{club.coach.name}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{club.coach.nationality} ({club.coach.specialty} coach)</span>
                </div>
                <div className="bg-[#1c2230] p-3 rounded-xl border border-white/5">
                  <span className="text-slate-500 font-bold block uppercase text-[8px] font-mono mb-1">Club Mentality Style</span>
                  <span className="text-amber-500 font-extrabold block text-sm">{club.mentality}</span>
                </div>
              </div>

              <div className="divide-y divide-white/5 border border-white/5 rounded-xl bg-black/20">
                {club.squad.map((player) => (
                  <div 
                    key={player.id}
                    onClick={() => onOpenPlayerDossier(player.id)}
                    className="py-2.5 flex justify-between items-center hover:bg-white/5 px-3 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-300 text-xs group-hover:text-sky-400 hover:underline">{player.name}</span>
                      <span className="text-[8px] text-slate-500 font-mono">ID: #{player.id.substring(player.id.lastIndexOf('-') + 1)}</span>
                    </div>
                    <div className="flex gap-2.5 items-center">
                      <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border border-white/5 ${
                        player.position === 'GK' ? 'bg-orange-500/10 text-orange-400' :
                        player.position === 'DEF' ? 'bg-sky-500/10 text-sky-400' :
                        player.position === 'MID' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-rose-500/10 text-rose-455'
                      }`}>{player.position}</span>
                      <span className="font-mono font-black text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{player.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'MATCHES' && (
            <div className="space-y-3">
              {clubFixtures.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 font-mono uppercase">No fixtures played yet</span>
                </div>
              ) : (
                <div className="relative border-l border-white/10 ml-3 space-y-4">
                  {clubFixtures.map(fx => {
                    const isHome = fx.homeClubId === club.id;
                    const clubTeamScore = isHome ? fx.homeScore : fx.awayScore;
                    const oppScore = isHome ? fx.awayScore : fx.homeScore;
                    let resultColor = 'text-slate-500 bg-slate-800'; // Draw
                    let resultBadge = 'DRAW';
                    if (clubTeamScore! > oppScore!) {
                      resultColor = 'text-emerald-400 bg-emerald-500/20';
                      resultBadge = 'WIN';
                    } else if (clubTeamScore! < oppScore!) {
                      resultColor = 'text-rose-400 bg-rose-500/20';
                      resultBadge = 'LOSS';
                    }

                    return (
                      <div key={fx.id} className="relative pl-6 p-2">
                        <span className={`absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full outline outline-4 outline-[#121620] ${resultColor.split(' ')[0].replace('text-', 'bg-')}`}></span>
                        <div 
                          className="bg-[#1c2230] border border-white/5 rounded-xl p-3 hover:bg-slate-800/80 transition-all cursor-pointer"
                          onClick={() => setExpandedMatchId(expandedMatchId === fx.id ? null : fx.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded font-mono ${resultColor}`}>
                                {resultBadge}
                              </span>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-mono">Week {fx.week} • {fx.id.includes('cup') ? 'Tournament' : 'League'}</span>
                                <span className="text-xs font-bold text-slate-200 uppercase mt-0.5 block">
                                  {isHome ? 'Vs Away' : 'At Home'} Opponent
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block font-mono">Scoreline</span>
                              <span className="text-base font-black text-white">
                                {clubTeamScore} - {oppScore}
                                {fx.homePens !== undefined && <span className="text-[9px] text-amber-500 ml-1 font-mono hover:underline cursor-help" title={`Pens: ${isHome ? fx.homePens : fx.awayPens}-${isHome ? fx.awayPens : fx.homePens}`}>*(PEN)</span>}
                              </span>
                            </div>
                          </div>
                          
                          {expandedMatchId === fx.id && (
                            <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Home Goals:</span>
                                <span className="text-sky-400 text-right">{fx.homeGoalsDetail?.filter(g => g).join(', ') || 'None'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Away Goals:</span>
                                <span className="text-sky-400 text-right">{fx.awayGoalsDetail?.filter(g => g).join(', ') || 'None'}</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-slate-500">Possession:</span>
                                <span className="text-slate-300">{fx.homePossession}% - {fx.awayPossession}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Shots (Target):</span>
                                <span className="text-slate-300">{fx.homeShots} ({fx.homeShotsOnTarget}) - {fx.awayShots} ({fx.awayShotsOnTarget})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-[#1c2230] p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">Played</span>
                  <strong className="text-lg text-white font-black">{club.played}</strong>
                </div>
                <div className="bg-[#1c2230] p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">Won</span>
                  <strong className="text-lg text-emerald-400 font-black">{club.won}</strong>
                </div>
                <div className="bg-[#1c2230] p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">Drawn</span>
                  <strong className="text-lg text-slate-400 font-black">{club.drawn}</strong>
                </div>
                <div className="bg-[#1c2230] p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">Lost</span>
                  <strong className="text-lg text-rose-455 font-black">{club.lost}</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Points Logged</span>
                  <div className="text-3xl font-black text-sky-400 leading-none">{club.points} <span className="text-xs text-slate-500">Pts</span></div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Goal Differential</span>
                  <div className={`text-xl font-black leading-none ${club.goalDifference > 0 ? 'text-emerald-400' : club.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">GF: {club.goalsFor} | GA: {club.goalsAgainst}</span>
                </div>
              </div>

              {club.streak && club.streak.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2 border-b border-white/5 pb-1">Recent Form Pattern</span>
                  <div className="flex gap-2">
                    {club.streak.slice(-10).map((r, i) => (
                      <span key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                        r === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                        r === 'D' ? 'bg-slate-800 text-slate-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-white/5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all cursor-pointer"
          >
            Close Club Profile
          </button>
        </div>

      </div>
    </div>
  );
};
