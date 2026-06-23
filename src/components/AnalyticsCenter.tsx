import React, { useState } from 'react';
import { Trophy, Award, Landmark, TrendingUp, ShieldAlert, Heart, Calendar, Zap, AlertCircle } from 'lucide-react';
import { Club, Player } from '../types';

interface AnalyticsCenterProps {
  allClubs: Club[];
  leagueFixtures?: import('../types').Fixture[];
  tournamentFixtures?: import('../types').Fixture[];
  onTapPlayer: (id: string) => void;
  onTapClub: (id: string) => void;
}

export const AnalyticsCenter: React.FC<AnalyticsCenterProps> = ({
  allClubs,
  onTapPlayer,
  onTapClub
}) => {
  const [statsCampaign, setStatsCampaign] = useState<'league' | 'cup'>('league');

  // Flatten all players inside all clubs
  const allPlayersMapped = allClubs.flatMap(club => 
    club.squad.map(p => ({
      ...p,
      clubId: club.id,
      clubName: club.name,
      clubColor: club.color
    }))
  );

  const isLeague = statsCampaign === 'league';

  // Get Top Scorers
  const topScorers = [...allPlayersMapped]
    .map(p => ({
      ...p,
      metricValue: isLeague ? p.goals : (p.tournamentGoals || 0)
    }))
    .filter(p => p.metricValue > 0)
    .sort((a, b) => b.metricValue - a.metricValue || b.rating - a.rating)
    .slice(0, 10);

  // Get Top Assists
  const topAssists = [...allPlayersMapped]
    .map(p => ({
      ...p,
      metricValue: isLeague ? p.assists : (p.tournamentAssists || 0)
    }))
    .filter(p => p.metricValue > 0)
    .sort((a, b) => b.metricValue - a.metricValue || b.rating - a.rating)
    .slice(0, 10);

  // Get Top Saves
  const topSaves = [...allPlayersMapped]
    .filter(p => p.position === 'GK')
    .map(p => ({
      ...p,
      metricValue: isLeague ? (p.saves || 0) : (p.tournamentSaves || 0)
    }))
    .filter(p => p.metricValue > 0)
    .sort((a, b) => b.metricValue - a.metricValue || b.rating - a.rating)
    .slice(0, 8);

  // Get Bookings (Y=1pt, Red=3pts)
  const topCards = [...allPlayersMapped]
    .map(p => {
      const yellow = isLeague ? p.yellowCards : (p.tournamentYellowCards || 0);
      const red = isLeague ? p.redCards : (p.tournamentRedCards || 0);
      return {
        ...p,
        yellow,
        red,
        metricValue: yellow + (red * 3)
      };
    })
    .filter(p => p.metricValue > 0)
    .sort((a, b) => b.metricValue - a.metricValue || a.name.localeCompare(b.name))
    .slice(0, 8);

  return (
    <div className="space-y-6 select-none animate-fadeIn pb-12">
      
      {/* HEADER SECTION WITH STATS CAMPAIGN SUBTABS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121620] border border-white/10 p-5 rounded-2xl">
        <div>
          <h2 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#facc15]" />
            Official Analytical Stats Leaderboards
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare elite personal milestones, defensive saves index, and booking tallies across all 36 clubs.
          </p>
        </div>

        {/* Stats Subtoggling Pill */}
        <div className="bg-slate-900 border border-white/10 p-1 rounded-xl flex gap-1.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setStatsCampaign('league')}
            className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
              isLeague ? 'bg-sky-500 text-black font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Elite SL Stats
          </button>
          <button
            onClick={() => setStatsCampaign('cup')}
            className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
              !isLeague ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Champions Cup Stats
          </button>
        </div>
      </div>

      {/* STATS BOARDS BENTO GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 1. TOP GOAL SCORERS COLLUM */}
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#facc15]" />
              Top Goal Scorers
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Goals Index</span>
          </div>

          {topScorers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-550 italic font-mono uppercase">
              No goal statistics recorded for this campaign active timeline.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
              {topScorers.map((player, idx) => (
                <div 
                  key={player.id} 
                  onClick={() => onTapPlayer(player.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer px-2 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono text-slate-500 font-extrabold w-3 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <span className="font-extrabold text-white text-xs hover:text-sky-400 transition-all block">{player.name}</span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onTapClub(player.clubId);
                        }}
                        className="text-[9px] uppercase font-mono tracking-wider font-bold block transition-all hover:underline mt-0.5"
                        style={{ color: player.clubColor }}
                      >
                        {player.clubName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">OVR {player.rating}</span>
                    <span className="bg-sky-500/10 text-sky-400 font-mono font-black py-0.5 px-3 rounded-md text-xs border border-sky-500/20 text-center w-12 block">
                      {player.metricValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. TOP ASSISTS COLLUM */}
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Assists Playmakers
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Assists Index</span>
          </div>

          {topAssists.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-550 italic font-mono uppercase">
              No playmaker assistance records compiled for this campaign timeline.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
              {topAssists.map((player, idx) => (
                <div 
                  key={player.id} 
                  onClick={() => onTapPlayer(player.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer px-2 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono text-slate-500 font-extrabold w-3 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <span className="font-extrabold text-white text-xs hover:text-sky-400 transition-all block">{player.name}</span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onTapClub(player.clubId);
                        }}
                        className="text-[9px] uppercase font-mono tracking-wider font-bold block transition-all hover:underline mt-0.5"
                        style={{ color: player.clubColor }}
                      >
                        {player.clubName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">OVR {player.rating}</span>
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono font-black py-0.5 px-3 rounded-md text-xs border border-emerald-500/25 text-center w-12 block">
                      {player.metricValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. GOALKEEPER SAVES INDEX */}
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-sky-400" />
              Defensive Saves Index (SVS)
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Shots Saved</span>
          </div>

          {topSaves.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-550 italic font-mono uppercase">
              No goalkeeper saves data logged for this campaign year.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-1">
              {topSaves.map((player, idx) => (
                <div 
                  key={player.id} 
                  onClick={() => onTapPlayer(player.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer px-2 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono text-slate-500 font-extrabold w-3 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <span className="font-extrabold text-white text-xs hover:text-sky-400 transition-all block">{player.name}</span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onTapClub(player.clubId);
                        }}
                        className="text-[9px] uppercase font-mono tracking-wider font-bold block transition-all hover:underline mt-0.5"
                        style={{ color: player.clubColor }}
                      >
                        {player.clubName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-400 bg-orange-500/10 border border-orange-500/20 px-1.5 rounded text-[8px] uppercase font-extrabold">GK Role</span>
                    <span className="bg-amber-500/10 text-amber-400 font-mono font-black py-0.5 px-3 rounded-md text-xs border border-amber-505/20 text-center w-12 block">
                      {player.metricValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. DISCIPLINARY LOGS MODULE */}
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Disciplinary Index & Cards
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Y:1pt | R:3pts</span>
          </div>

          {topCards.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-550 italic font-mono uppercase">
              Club registers clean! No booking events recorded in the current schedule.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-1">
              {topCards.map((player, idx) => (
                <div 
                  key={player.id} 
                  onClick={() => onTapPlayer(player.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer px-2 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono text-slate-500 font-extrabold w-3 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <span className="font-extrabold text-white text-xs hover:text-sky-400 transition-all block">{player.name}</span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onTapClub(player.clubId);
                        }}
                        className="text-[9px] uppercase font-mono tracking-wider font-bold block transition-all hover:underline mt-0.5"
                        style={{ color: player.clubColor }}
                      >
                        {player.clubName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="flex items-center gap-1 font-bold text-[#facc15] bg-[#facc15]/10 px-1.5 py-0.5 rounded">
                      <span className="w-2 h-3 bg-amber-500 rounded-sm"></span> {player.yellow}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-rose-450 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      <span className="w-2 h-3 bg-rose-500 rounded-sm"></span> {player.red}
                    </span>
                    <span className="text-[9px] text-slate-550 ml-1">Score: {player.metricValue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
