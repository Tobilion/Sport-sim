import React, { useRef, useEffect } from 'react';
import { Play, Pause, ChevronRight, Sliders, Volume2 } from 'lucide-react';
import { Club, LiveMatchSimulation, TeamMentalityType } from '../types';
import PitchCanvas from './PitchCanvas';

interface MatchCenterProps {
  simulation: LiveMatchSimulation;
  homeClub: Club;
  awayClub: Club;
  isPlaying: boolean;
  simSpeed: number; // in Milliseconds
  onTogglePlay: () => void;
  onStepSimulation: () => void;
  onSetSpeed: (speedMs: number) => void;
  onChangeUserMentality: (ment: TeamMentalityType) => void;
  userClubId: string;
  onTapPlayer?: (playerId: string) => void;
  onTapClub?: (clubId: string) => void;
}

export const MatchCenter: React.FC<MatchCenterProps> = ({
  simulation,
  homeClub,
  awayClub,
  isPlaying,
  simSpeed,
  onTogglePlay,
  onStepSimulation,
  onSetSpeed,
  onChangeUserMentality,
  userClubId,
  onTapPlayer,
  onTapClub
}) => {
  const commentaryContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = commentaryContainerRef.current;
    if (container) {
      // Safe internal container scroll adjustment - preserves page scroll coordinate placement completely
      container.scrollTop = container.scrollHeight;
    }
  }, [simulation.events.length]);

  const hShotsSaved = simulation.events.filter(e => e.teamId === homeClub.id && e.type === 'shot_saved').length;
  const hShotsMiss = simulation.events.filter(e => e.teamId === homeClub.id && e.type === 'shot_miss').length;
  const hGoalsNum = simulation.homeScore;
  const hTotalShots = hShotsSaved + hShotsMiss + hGoalsNum;

  const aShotsSaved = simulation.events.filter(e => e.teamId === awayClub.id && e.type === 'shot_saved').length;
  const aShotsMiss = simulation.events.filter(e => e.teamId === awayClub.id && e.type === 'shot_miss').length;
  const aGoalsNum = simulation.awayScore;
  const aTotalShots = aShotsSaved + aShotsMiss + aGoalsNum;

  const hFouls = simulation.events.filter(e => e.teamId === homeClub.id && (e.type === 'foul' || e.type === 'yellow_card' || e.type === 'red_card')).length;
  const aFouls = simulation.events.filter(e => e.teamId === awayClub.id && (e.type === 'foul' || e.type === 'yellow_card' || e.type === 'red_card')).length;

  const hYellow = simulation.events.filter(e => e.teamId === homeClub.id && e.type === 'yellow_card').length;
  const aYellow = simulation.events.filter(e => e.teamId === awayClub.id && e.type === 'yellow_card').length;

  const hRed = simulation.events.filter(e => e.teamId === homeClub.id && e.type === 'red_card').length;
  const aRed = simulation.events.filter(e => e.teamId === awayClub.id && e.type === 'red_card').length;

  const isHomeUser = homeClub.id === userClubId;
  const isAwayUser = awayClub.id === userClubId;
  const userTeam = isHomeUser ? homeClub : (isAwayUser ? awayClub : null);

  const formatPossession = () => {
    if (simulation.possession === 'home') {
      return { home: '64%', away: '36%' };
    }
    return { home: '42%', away: '58%' };
  };

  const currentPossession = formatPossession();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none animate-fadeIn">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#121620] rounded-2xl border border-white/10 p-5 flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative">
            <div 
              onClick={() => onTapClub?.(homeClub.id)}
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center p-2.5 font-bold text-white border-2 text-sm shadow cursor-pointer hover:scale-105 hover:border-sky-400 transition-all"
              style={{ borderColor: homeClub.color }}
            >
              {homeClub.name.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div 
                onClick={() => onTapClub?.(homeClub.id)}
                className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer hover:underline hover:text-sky-400"
              >
                {isHomeUser && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>}
                {homeClub.name} {isHomeUser && '(YOU)'}
              </div>
              <div className="text-xl font-black text-white font-mono mt-0.5">HOME</div>
            </div>
          </div>

          <div className="flex flex-col items-center relative gap-1">
            <div className="text-4xl font-black font-mono text-white tracking-tighter drop-shadow-md">
              {simulation.homeScore} - {simulation.awayScore}
            </div>
            {simulation.isFinished ? (
              <span className="text-[9px] font-mono text-red-400 bg-red-400/10 px-2.5 py-0.5 rounded-full font-bold uppercase border border-red-500/10">
                FULL TIME RESULT
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                TICK {simulation.tick} / 30
              </span>
            )}
            {simulation.isSpectating && (
              <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-505/20 px-2 py-0.5 rounded font-mono font-black uppercase mt-1 animate-pulse">
                Spectating (No Coach Power)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5 text-right relative flex-row-reverse">
            <div 
              onClick={() => onTapClub?.(awayClub.id)}
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center p-2.5 font-bold text-white border-2 text-sm shadow cursor-pointer hover:scale-105 hover:border-sky-400 transition-all"
              style={{ borderColor: awayClub.color }}
            >
              {awayClub.name.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div 
                onClick={() => onTapClub?.(awayClub.id)}
                className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer hover:underline hover:text-sky-400"
              >
                {isAwayUser && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>}
                {awayClub.name} {isAwayUser && '(YOU)'}
              </div>
              <div className="text-xl font-black text-white font-mono mt-0.5">AWAY</div>
            </div>
          </div>
        </div>

        <div className="h-[430px]">
          <PitchCanvas
            ballX={simulation.ballX}
            ballY={simulation.ballY}
            possession={simulation.possession}
            homeClub={homeClub}
            awayClub={awayClub}
            zone={simulation.zone}
          />
        </div>

        <div className="bg-[#0b0e14] border border-white/10 rounded-2xl p-4 flex flex-col h-48">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-mono font-bold">
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Real-Time Commentary Feed Log</span>
            </div>
            <span className="text-[9px] text-slate-600 font-mono">TICK SCALE x15-HALF</span>
          </div>

          <div ref={commentaryContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-2 scroll-smooth">
            {simulation.events.map((evt, idx) => {
              const isGoal = evt.type === 'goal';
              const isCard = evt.type === 'yellow_card' || evt.type === 'red_card';
              
              return (
                <div 
                  key={idx} 
                  className={`flex gap-3 text-xs p-1.5 rounded transition-all animate-fadeIn ${
                    isGoal ? 'bg-emerald-500/10 border-l-4 border-emerald-500 text-slate-200' :
                    isCard ? 'bg-amber-500/10 border-l-4 border-amber-500 text-slate-200' :
                    'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span className={`font-mono font-bold shrink-0 w-8 text-center text-[10px] ${isGoal ? 'text-emerald-400' : 'opacity-40'}`}>
                    {evt.minute}'
                  </span>
                  <p className="flex-1 text-[11.5px] leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-4 font-medium">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] font-mono border-b border-white/5 pb-2">
            Simulation Controller
          </h3>

          <div className="flex gap-2">
            <button
              id="simulation-play-pause"
              onClick={onTogglePlay}
              disabled={simulation.isFinished}
              className={`flex-1 py-3 text-[#000] font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 shrink-0" /> : <Play className="w-3.5 h-3.5 shrink-0" />}
              {isPlaying ? 'PAUSE GAME' : 'START SIM'}
            </button>

            <button
              id="simulation-step-forward"
              onClick={onStepSimulation}
              disabled={isPlaying || simulation.isFinished}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all cursor-pointer disabled:opacity-30 flex items-center justify-center"
              title="Step Single Tick"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Speed modifier presets</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                id="sim-speed-normal"
                onClick={() => onSetSpeed(2000)}
                className={`py-1.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                  simSpeed === 2000 ? 'bg-sky-500 text-black font-black' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                1x Broadcast
              </button>
              <button
                id="sim-speed-medium"
                onClick={() => onSetSpeed(800)}
                className={`py-1.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                  simSpeed === 800 ? 'bg-sky-500 text-black font-black' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                2x Fast
              </button>
              <button
                id="sim-speed-ultra"
                onClick={() => onSetSpeed(150)}
                className={`py-1.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                  simSpeed === 150 ? 'bg-sky-500 text-black font-black shadow-[0_0_10px_rgba(56,189,248,0.2)]' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                🏎️ Rapid
              </button>
            </div>
          </div>
        </div>

        {userTeam && (
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                In-Play Tactics Board
              </span>
              <span className="text-[9px] bg-sky-500/15 text-sky-400 font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                {userTeam.mentality} ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase font-mono">Select Active Team Mentality</label>
              <select
                id="mentality-tactical-select"
                value={userTeam.mentality}
                onChange={e => onChangeUserMentality(e.target.value as TeamMentalityType)}
                disabled={simulation.isFinished}
                className="w-full bg-[#1c2230] border border-white/10 text-xs font-bold text-white rounded-lg p-2.5 outline-none focus:border-sky-500 transition-all uppercase cursor-pointer text-slate-300"
              >
                <option value="Tiki-Taka">Tiki-Taka (Tactical Passing Accuracy)</option>
                <option value="Gegenpressing">Gegenpressing (Interception & Pressing)</option>
                <option value="Park the Bus">Park the Bus (Aura Defensive Walls)</option>
                <option value="Counter-Attack">Counter-Attack (Dynamic Strike Transitions)</option>
              </select>
            </div>
          </div>
        )}

        <div className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] font-mono border-b border-white/5 pb-2">
            Matchday Stat Board
          </h3>

          <div className="space-y-3">
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">{currentPossession.home}</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Dominance</span>
                <span className="text-slate-300">{currentPossession.away}</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: currentPossession.home }}></div>
                <div className="h-full bg-[#3c4c6e] flex-1"></div>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">{hTotalShots}</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Total Shots</span>
                <span className="text-slate-300">{aTotalShots}</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden flex">
                <div className="h-full bg-sky-500" style={{ width: `${(hTotalShots || 1) / ((hTotalShots + aTotalShots) || 1) * 100}%` }}></div>
                <div className="h-full bg-[#3c4c6e] flex-1"></div>
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono border-y border-white/5 py-2">
              <span className="text-slate-400 font-bold">{hShotsSaved}</span>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">Goal Keeper Saves</span>
              <span className="text-slate-400 font-bold">{aShotsSaved}</span>
            </div>

            <div className="flex justify-between text-xs font-mono border-b border-white/5 pb-2">
              <span className="text-slate-400 font-bold">{hFouls}</span>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">Fouls</span>
              <span className="text-slate-400 font-bold">{aFouls}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <div className="flex gap-1.5">
                <span className="bg-amber-500 w-3 h-4 block rounded-sm border border-amber-400/40" title="Yellow"></span>
                <strong className="text-slate-400">{hYellow}</strong>
                <span className="bg-rose-500 w-3 h-4 block rounded-sm border border-rose-500/40 ml-2" title="Red"></span>
                <strong className="text-slate-400">{hRed}</strong>
              </div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">Cards Issued</span>
              <div className="flex gap-1.5 flex-row-reverse">
                <strong className="text-slate-400">{aYellow}</strong>
                <span className="bg-amber-500 w-3 h-4 block rounded-sm border border-amber-400/40" title="Yellow"></span>
                <strong className="text-slate-400">{aRed}</strong>
                <span className="bg-rose-500 w-3 h-4 block rounded-sm border border-rose-500/40 mr-2" title="Red"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#121620] border border-white/10 rounded-2xl p-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] font-mono border-b border-white/5 pb-2 mb-3">
            Active Squad Lineups
          </h2>

          <div className="space-y-4 max-h-[174px] overflow-y-auto pr-1">
            <div>
              <div className="text-[10px] font-bold text-white uppercase mb-1.5 flex justify-between">
                <span 
                  onClick={() => onTapClub?.(homeClub.id)}
                  className="cursor-pointer hover:underline hover:text-sky-400"
                >
                  {homeClub.name}
                </span>
                <span className="font-mono text-[9px] text-[#22c55e]">
                  OVR {Math.round(homeClub.squad.reduce((s, p) => s + p.rating, 0) / homeClub.squad.length)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                {homeClub.squad.filter(p => p.isStarting).map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => onTapPlayer?.(p.id)}
                    className="bg-white/5 rounded px-2 py-1 flex justify-between cursor-pointer hover:bg-sky-500/10 hover:text-sky-400"
                  >
                    <span className="text-slate-300 truncate max-w-[85px]">{p.name}</span>
                    <span className="text-amber-500 font-bold">{p.rating}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-white uppercase mb-1.5 flex justify-between">
                <span 
                  onClick={() => onTapClub?.(awayClub.id)}
                  className="cursor-pointer hover:underline hover:text-sky-400"
                >
                  {awayClub.name}
                </span>
                <span className="font-mono text-[9px] text-[#22c55e]">
                  OVR {Math.round(awayClub.squad.reduce((s, p) => s + p.rating, 0) / awayClub.squad.length)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                {awayClub.squad.filter(p => p.isStarting).map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => onTapPlayer?.(p.id)}
                    className="bg-white/5 rounded px-2 py-1 flex justify-between cursor-pointer hover:bg-sky-500/10 hover:text-sky-400"
                  >
                    <span className="text-slate-300 truncate max-w-[85px]">{p.name}</span>
                    <span className="text-amber-500 font-bold">{p.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
