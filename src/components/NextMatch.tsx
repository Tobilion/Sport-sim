import React from 'react';
import { 
  Play, 
  Award, 
  Shield, 
  Users, 
  Zap, 
  TrendingUp, 
  Activity, 
  Calendar, 
  Flame, 
  Trophy, 
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Club, Player, Fixture, BracketNode } from '../types';

export const DUAL_SCHEDULE = [
  { week: 1, type: 'league', label: 'League Matchday 1' },
  { week: 2, type: 'league', label: 'League Matchday 2' },
  { week: 3, type: 'tournament', label: 'Prestige Champions Cup - Group Stage R1', stage: 'Group' },
  { week: 4, type: 'league', label: 'League Matchday 3' },
  { week: 5, type: 'league', label: 'League Matchday 4' },
  { week: 6, type: 'tournament', label: 'Prestige Champions Cup - Group Stage R2', stage: 'Group' },
  { week: 7, type: 'league', label: 'League Matchday 5' },
  { week: 8, type: 'league', label: 'League Matchday 6' },
  { week: 9, type: 'tournament', label: 'Prestige Champions Cup - Group Stage R3', stage: 'Group' },
  { week: 10, type: 'league', label: 'League Matchday 7' },
  { week: 11, type: 'league', label: 'League Matchday 8' },
  { week: 12, type: 'tournament', label: 'Prestige Champions Cup - Round of 16', stage: 'R16' },
  { week: 13, type: 'league', label: 'League Matchday 9' },
  { week: 14, type: 'league', label: 'League Matchday 10' },
  { week: 15, type: 'tournament', label: 'Prestige Champions Cup - Quarter-Finals', stage: 'QF' },
  { week: 16, type: 'league', label: 'League Matchday 11' },
  { week: 17, type: 'league', label: 'League Matchday 12' },
  { week: 18, type: 'tournament', label: 'Prestige Champions Cup - Semi-Finals', stage: 'SF' },
  { week: 19, type: 'league', label: 'League Matchday 13' },
  { week: 20, type: 'league', label: 'League Matchday 14' },
  { week: 21, type: 'tournament', label: 'Prestige Champions Cup - Champions Grand Final', stage: 'F' },
  { week: 22, type: 'league', label: 'League Matchday 15' },
  { week: 23, type: 'league', label: 'League Matchday 16' },
  { week: 24, type: 'league', label: 'League Matchday 17' },
  { week: 25, type: 'league', label: 'League Matchday 18' },
  { week: 26, type: 'league', label: 'League Matchday 19' },
];

interface NextMatchProps {
  userClub: Club;
  allClubs: Club[];
  campaignType: 'league' | 'dual';
  currentWeek: number;
  currentCupRound: string;
  leagueFixtures: Fixture[];
  tournamentFixtures: Fixture[];
  cupBracket: BracketNode[];
  onStartMatch: (fixtureId: string, homeId: string, awayId: string, isSpectating: boolean) => void;
  onQuickSimMatch: (fixtureId: string, homeId: string, awayId: string) => void;
  onAdvanceWeek: () => void;
  onTapClub: (id: string) => void;
  onTapPlayer: (id: string) => void;
  userMentality: string;
  onChangeUserMentality: (mentality: any) => void;
  activeMatchesToPlay: (Fixture | BracketNode)[];
}

export const NextMatch: React.FC<NextMatchProps> = ({
  userClub,
  allClubs,
  campaignType,
  currentWeek,
  currentCupRound,
  leagueFixtures,
  tournamentFixtures,
  cupBracket,
  onStartMatch,
  onQuickSimMatch,
  onAdvanceWeek,
  onTapClub,
  onTapPlayer,
  userMentality,
  onChangeUserMentality,
  activeMatchesToPlay,
}) => {
  const getClub = (id: string) => allClubs.find(c => c.id === id);

  // 1. Current schedule state
  const weekInfo = DUAL_SCHEDULE.find(s => s.week === currentWeek);
  const isLeagueWeek = campaignType === 'league' || (weekInfo ? weekInfo.type === 'league' : true);
  const currentWeekStage = weekInfo?.stage || 'Group';

  // 2. Scheduled player match this week
  const userLeagueMatchThisWeek = leagueFixtures.find(
    f => f.week === currentWeek && (f.homeClubId === userClub.id || f.awayClubId === userClub.id)
  );

  let userTournamentMatchThisWeek: any = null;
  if (campaignType === 'dual') {
    if (currentWeekStage === 'Group') {
      userTournamentMatchThisWeek = tournamentFixtures?.find(
        f => f.week === currentWeek && (f.homeClubId === userClub.id || f.awayClubId === userClub.id)
      );
    } else {
      userTournamentMatchThisWeek = cupBracket?.find(
        n => n.round === currentWeekStage && (n.homeClubId === userClub.id || n.awayClubId === userClub.id)
      );
    }
  }

  // 3. User Next uncompleted match for league
  const nextLeagueMatch = leagueFixtures.find(
    f => !f.isCompleted && (f.homeClubId === userClub.id || f.awayClubId === userClub.id)
  );

  // User Next uncompleted match for tournament
  const nextGroupMatch = tournamentFixtures?.find(
    f => !f.isCompleted && (f.homeClubId === userClub.id || f.awayClubId === userClub.id)
  );
  const nextKnockoutMatch = cupBracket?.find(
    n => !n.isCompleted && (n.homeClubId === userClub.id || n.awayClubId === userClub.id)
  );
  const nextTournamentMatch = nextGroupMatch || nextKnockoutMatch || null;

  // 4. Verify if assignment this week is resolved
  const isLeagueWeekMatchDone = !userLeagueMatchThisWeek || userLeagueMatchThisWeek.isCompleted;
  const isTournamentWeekMatchDone = campaignType !== 'dual' || !userTournamentMatchThisWeek || userTournamentMatchThisWeek.isCompleted;
  const isAllAssignmentsDoneThisWeek = isLeagueWeek ? isLeagueWeekMatchDone : isTournamentWeekMatchDone;

  const currentMatchToPlay = isLeagueWeek ? userLeagueMatchThisWeek : userTournamentMatchThisWeek;
  const hasMatchToPlayThisWeek = !!currentMatchToPlay;

  // WIN PROBABILITY GENERATION HELPER
  const computePreMatchExpectancy = (f: Fixture | BracketNode) => {
    const hId = f.homeClubId;
    const aId = f.awayClubId;
    if (!hId || !aId) return { homeOvr: 70, awayOvr: 70, homeProb: 40, awayProb: 40, drawProb: 20 };

    const home = getClub(hId);
    const away = getClub(aId);
    if (!home || !away) return { homeOvr: 70, awayOvr: 70, homeProb: 40, awayProb: 40, drawProb: 20 };

    const homeOvr = Math.round(home.squad.reduce((s, p) => s + p.rating, 0) / home.squad.length);
    const awayOvr = Math.round(away.squad.reduce((s, p) => s + p.rating, 0) / away.squad.length);
    const total = homeOvr + awayOvr;

    let homeProb = Math.min(85, Math.max(15, Math.ceil((homeOvr / total) * 100) + 4));
    let awayProb = Math.min(85, Math.max(15, 100 - homeProb - 10));
    let drawProb = 100 - homeProb - awayProb;

    return { homeOvr, awayOvr, homeProb, awayProb, drawProb };
  };

  // Squad starters for panel
  const starters = [...userClub.squad]
    .filter(p => p.isStarting)
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none animate-fadeIn pb-12">
      
      {/* 1. CURRENT TIMELINE OVERVIEW HUD */}
      <div className="bg-[#121620] border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20">
            <CalendarDays className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-black block">CONSL_TIMELINE_STATUS</span>
            <span className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5 leading-none mt-1">
              Week {currentWeek} / 26
              <span className="text-slate-600 font-normal">|</span> 
              <span className="text-[#facc15] font-extrabold">{weekInfo?.label || `League Matchday ${currentWeek}`}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0c0f16] border border-white/5 p-3 rounded-xl min-w-[260px] md:min-w-0">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div className="text-left text-xs">
            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Timeline Agenda Theme</span>
            <span className="text-white font-extrabold uppercase mt-0.5 block">
              {isLeagueWeek ? '🏆 Elite league matchday focus' : '⭐ European Prestige Cup week'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DOUBLE DIVISION SPLIT: LEAGUE & TOURNAMENT NEXT MATCH PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MATCH DETAILS COLUMNS (LEFT/MID) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: ELITE SUPERLEAGUE MATCH PREVIEW */}
            <div className={`bg-[#121620] border rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden transition-all ${
              isLeagueWeek && !isLeagueWeekMatchDone
                ? 'border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.06)] scale-[1.01]'
                : 'border-white/10 opacity-90'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/[0.01] via-transparent to-transparent pointer-events-none"></div>
              
              <div>
                {/* Header Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-sky-400" />
                    Elite SuperLeague
                  </span>

                  {isLeagueWeek ? (
                    isLeagueWeekMatchDone ? (
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded font-black uppercase">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono text-black bg-sky-400 px-2 py-0.5 rounded font-black uppercase animate-pulse">
                        PLAYABLE NEXT
                      </span>
                    )
                  ) : (
                    <span className="text-[8px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">
                      Awaiting
                    </span>
                  )}
                </div>

                {/* Matchup Data */}
                {nextLeagueMatch ? (() => {
                  const home = getClub(nextLeagueMatch.homeClubId);
                  const away = getClub(nextLeagueMatch.awayClubId);
                  const isHome = home?.id === userClub.id;
                  const opp = isHome ? away : home;
                  const info = computePreMatchExpectancy(nextLeagueMatch);
                  const isCurrentWeekMatch = nextLeagueMatch.week === currentWeek;

                  if (!home || !away || !opp) return null;

                  return (
                    <div className="space-y-4">
                      {/* Visual matchup */}
                      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="flex flex-col items-center space-y-1.5 w-5/12">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                            style={{ backgroundColor: `${home.color}20`, border: `2px solid ${home.color}` }}
                          >
                            {home.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-white font-extrabold text-xs text-center truncate w-full">{home.name}</span>
                          <span className="text-[8px] text-slate-550 font-mono uppercase font-bold">OVR {info.homeOvr}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-2/12">
                          <span className="text-[10px] text-slate-500 font-serif font-bold italic">vs</span>
                          <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400 mt-1 text-center font-bold">
                            WK {nextLeagueMatch.week}
                          </span>
                        </div>

                        <div className="flex flex-col items-center space-y-1.5 w-5/12">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                            style={{ backgroundColor: `${away.color}20`, border: `2px solid ${away.color}` }}
                          >
                            {away.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-white font-extrabold text-xs text-center truncate w-full">{away.name}</span>
                          <span className="text-[8px] text-slate-550 font-mono uppercase font-bold">OVR {info.awayOvr}</span>
                        </div>
                      </div>

                      {/* Win Forecast indicator */}
                      <div className="bg-slate-950/30 p-3 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold uppercase">
                          <span>Home Win: {info.homeProb}%</span>
                          <span>Draw: {info.drawProb}%</span>
                          <span>Away Win: {info.awayProb}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden flex bg-white/5">
                          <span style={{ width: `${info.homeProb}%` }} className="h-full bg-sky-500 block"></span>
                          <span style={{ width: `${info.drawProb}%` }} className="h-full bg-amber-500 block"></span>
                          <span style={{ width: `${info.awayProb}%` }} className="h-full bg-rose-500 block"></span>
                        </div>
                      </div>

                      {/* Info bar / Form */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/30 p-2 border border-white/5 rounded-xl">
                        <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">
                          Opponent form: &nbsp;
                          <span className="font-mono tracking-widest text-[#facc15] font-black">{opp.streak.join('-') || 'N/A'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8 text-xs text-slate-550 border-2 border-dashed border-white/5 rounded-xl">
                    No remaining League matches found!
                  </div>
                )}
              </div>

              {/* Bottom control trigger */}
              {isLeagueWeek && nextLeagueMatch && nextLeagueMatch.week === currentWeek ? (
                <div className="mt-5 space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-black">TACT_MENTALITY:</span>
                    <select
                      value={userMentality}
                      onChange={e => onChangeUserMentality(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-white text-[10px] font-bold p-1 px-2 rounded-lg outline-none cursor-pointer focus:border-sky-500 transition-all font-mono"
                    >
                      <option value="Tiki-Taka">Tiki-Taka</option>
                      <option value="Gegenpressing">Gegenpressing</option>
                      <option value="Park the Bus">Park the Bus</option>
                      <option value="Counter-Attack">Counter-Attack</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="play-league-btn"
                      onClick={() => onStartMatch(nextLeagueMatch.id, nextLeagueMatch.homeClubId, nextLeagueMatch.awayClubId, false)}
                      className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-450 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-black fill-current" />
                      Live Broadcast
                    </button>
                    <button
                      id="quicksim-league-btn"
                      onClick={() => onQuickSimMatch(nextLeagueMatch.id, nextLeagueMatch.homeClubId, nextLeagueMatch.awayClubId)}
                      className="px-3.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      title="Quick simulation"
                    >
                      Quick Sim
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 bg-slate-950/55 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[9px] text-slate-400 font-mono uppercase leading-normal">
                    {isLeagueWeek && isLeagueWeekMatchDone 
                      ? '✓ Week assignment complete. Awaiting cycle advance.' 
                      : `🔒 Active League Match is locked (Wait for Week ${nextLeagueMatch?.week})`}
                  </span>
                </div>
              )}
            </div>

            {/* CARD 2: PRESTIGE CHAMPIONS CUP MATCH PREVIEW */}
            <div className={`bg-[#121620] border rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden transition-all ${
              !isLeagueWeek && !isTournamentWeekMatchDone && campaignType === 'dual'
                ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.06)] scale-[1.01]'
                : 'border-white/10 opacity-90'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/[0.01] via-transparent to-transparent pointer-events-none"></div>
              
              <div>
                {/* Header Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono font-black text-[#facc15] bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Award className="w-3.5 h-3.5 text-[#facc15]" />
                    Champions Cup
                  </span>

                  {campaignType === 'dual' ? (
                    !isLeagueWeek ? (
                      isTournamentWeekMatchDone ? (
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded font-black uppercase">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono text-black bg-[#facc15] px-2 py-0.5 rounded font-black uppercase animate-pulse">
                          PLAYABLE NEXT
                        </span>
                      )
                    ) : (
                      <span className="text-[8px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">
                        Awaiting
                      </span>
                    )
                  ) : (
                    <span className="text-[8px] font-mono text-rose-455 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded font-black uppercase">
                      INACTIVE
                    </span>
                  )}
                </div>

                {/* Campaign Type Check */}
                {campaignType !== 'dual' ? (
                  <div className="bg-slate-900 border border-white/5 rounded-xl p-5 text-center space-y-3 my-4 flex-1 flex flex-col justify-center">
                    <Shield className="w-8 h-8 text-slate-550 mx-auto opacity-50" />
                    <div className="space-y-1">
                      <h4 className="text-white text-xs font-bold uppercase">Cup Inactive in League Mode</h4>
                      <p className="text-[9px] text-slate-450 leading-relaxed">
                        To participate in the multi-stage European Champions Cup, configure your career save slot with a "Dual Campaign" settings profile!
                      </p>
                    </div>
                  </div>
                ) : nextTournamentMatch ? (() => {
                  const home = getClub(nextTournamentMatch.homeClubId || '');
                  const away = getClub(nextTournamentMatch.awayClubId || '');
                  const isHome = home?.id === userClub.id;
                  const opp = isHome ? away : home;
                  
                  if (!opp) {
                    return (
                      <div className="text-center py-8 text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-white/5 space-y-2">
                        <Calendar className="w-7 h-7 mx-auto text-slate-500 opacity-60" />
                        <div className="space-y-0.5">
                          <h4 className="text-white font-extrabold text-[11px] uppercase">Waiting for Bracket Settle</h4>
                          <span className="text-[9px] text-slate-500 font-mono">Tournament round bracket components pending!</span>
                        </div>
                      </div>
                    );
                  }

                  const info = computePreMatchExpectancy(nextTournamentMatch);
                  const isCupNode = 'round' in nextTournamentMatch;
                  const roundDesc = isCupNode ? (nextTournamentMatch as BracketNode).round : 'Group Stage';

                  return (
                    <div className="space-y-4">
                      {/* Visual matchup */}
                      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="flex flex-col items-center space-y-1.5 w-5/12">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                            style={{ backgroundColor: `${home ? home.color : '#334155'}20`, border: `2px solid ${home ? home.color : '#334155'}` }}
                          >
                            {home ? home.name.substring(0, 2).toUpperCase() : 'TBD'}
                          </div>
                          <span className="text-white font-extrabold text-xs text-center truncate w-full">{home ? home.name : 'Awaiting Draw'}</span>
                          <span className="text-[8px] text-slate-550 font-mono uppercase font-bold">OVR {info.homeOvr}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-2/12">
                          <span className="text-[10px] text-slate-550 font-serif font-bold italic">vs</span>
                          <span className="text-[8px] bg-[#facc15]/10 border border-[#facc15]/20 text-[#facc15] px-1.5 py-0.5 rounded font-mono text-[7px] mt-1 text-center font-bold uppercase truncate max-w-full">
                            {roundDesc}
                          </span>
                        </div>

                        <div className="flex flex-col items-center space-y-1.5 w-5/12">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                            style={{ backgroundColor: `${away ? away.color : '#334155'}20`, border: `2px solid ${away ? away.color : '#334155'}` }}
                          >
                            {away ? away.name.substring(0, 2).toUpperCase() : 'TBD'}
                          </div>
                          <span className="text-white font-extrabold text-xs text-center truncate w-full">{away ? away.name : 'Awaiting Draw'}</span>
                          <span className="text-[8px] text-slate-550 font-mono uppercase font-bold">OVR {info.awayOvr}</span>
                        </div>
                      </div>

                      {/* Win Forecast indicator */}
                      <div className="bg-slate-950/30 p-3 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold uppercase">
                          <span>Home Win: {info.homeProb}%</span>
                          <span>Draw: {info.drawProb}%</span>
                          <span>Away Win: {info.awayProb}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden flex bg-white/5">
                          <span style={{ width: `${info.homeProb}%` }} className="h-full bg-sky-500 block"></span>
                          <span style={{ width: `${info.drawProb}%` }} className="h-full bg-amber-500 block"></span>
                          <span style={{ width: `${info.awayProb}%` }} className="h-full bg-rose-50 block"></span>
                        </div>
                      </div>

                      {/* Info bar / Form */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/30 p-2 border border-white/5 rounded-xl">
                        <Activity className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
                        <span className="truncate">
                          Opponent form: &nbsp;
                          <span className="font-mono tracking-widest text-[#facc15] font-black">{opp.streak.join('-') || 'N/A'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8 text-xs text-slate-550 border-2 border-dashed border-white/5 rounded-xl">
                    No remaining Tournament fixtures scheduled!
                  </div>
                )}
              </div>

              {/* Bottom control trigger */}
              {campaignType === 'dual' && !isLeagueWeek && nextTournamentMatch && (nextTournamentMatch as any).week === currentWeek ? (
                <div className="mt-5 space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-black">TACT_MENTALITY:</span>
                    <select
                      value={userMentality}
                      onChange={e => onChangeUserMentality(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-white text-[10px] font-bold p-1 px-2 rounded-lg outline-none cursor-pointer focus:border-sky-500 transition-all font-mono"
                    >
                      <option value="Tiki-Taka">Tiki-Taka</option>
                      <option value="Gegenpressing">Gegenpressing</option>
                      <option value="Park the Bus">Park the Bus</option>
                      <option value="Counter-Attack">Counter-Attack</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="play-cup-btn"
                      onClick={() => onStartMatch(nextTournamentMatch.id, nextTournamentMatch.homeClubId || '', nextTournamentMatch.awayClubId || '', false)}
                      className="flex-1 py-2.5 bg-[#facc15] hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-black fill-current" />
                      Live Broadcast
                    </button>
                    <button
                      id="quicksim-cup-btn"
                      onClick={() => onQuickSimMatch(nextTournamentMatch.id, nextTournamentMatch.homeClubId || '', nextTournamentMatch.awayClubId || '')}
                      className="px-3.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      title="Quick simulation"
                    >
                      Quick Sim
                    </button>
                  </div>
                </div>
              ) : campaignType === 'dual' ? (
                <div className="mt-5 bg-slate-950/55 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[9px] text-slate-400 font-mono uppercase leading-normal">
                    {!isLeagueWeek && isTournamentWeekMatchDone 
                      ? '✓ Week assignment complete. Awaiting cycle advance.' 
                      : `🔒 Active tournament Match is locked (Awaiting tournament week scheduled match)`}
                  </span>
                </div>
              ) : null}
            </div>

          </div>

          {/* 3. DYNAMIC COMPLETE HERO ACTION PANEL */}
          {isAllAssignmentsDoneThisWeek ? (
            <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-[#121620] border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.02] pointer-events-none"></div>
              
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Week Matchday Assignments Finished!</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
                  You completed your first-team fixture operations for this timeline block. 
                  Let's simulate any remaining non-user matchups so we can advance standouts.
                </p>
                {activeMatchesToPlay.length > 0 && (
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-block font-bold">
                    ⚠️ {activeMatchesToPlay.length} non-user fixtures remaining to simulate
                  </span>
                )}
              </div>

              <div className="w-full md:w-auto shrink-0">
                <button
                  id="tab-cycle-advance-btn"
                  onClick={onAdvanceWeek}
                  className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-450 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-black fill-current animate-spin" />
                  {activeMatchesToPlay.length > 0 
                    ? `Simulate Remaining & Advance Week` 
                    : `Advance to Week ${currentWeek + 1}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#121620] border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <Flame className="w-4 h-4 text-[#facc15] animate-pulse" />
              <span className="text-[10px] text-slate-450 uppercase font-mono leading-none">
                Pending operational tasks: Please coach or quick simulate your active match schedule this week to proceed!
              </span>
            </div>
          )}

        </div>

        {/* LINEUP BRIEFING BAR (RIGHT COLUMN) */}
        <div>
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full min-h-[500px]">
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  Match Starting Lineup ({starters.length})
                </h3>
                <span className="text-[9px] bg-sky-500/10 text-sky-450 border border-sky-400/20 rounded px-1.5 py-0.5 uppercase font-mono font-bold">1st Team</span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {starters.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => onTapPlayer(p.id)}
                    id={`lin-player-${p.id}`}
                    className="bg-slate-900 border border-white/5 hover:border-sky-500/30 p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-xs hover:transform hover:translate-x-1"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[9px] font-mono text-slate-500 font-extrabold w-3 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                      <span className={`w-8 text-center text-[8px] font-black uppercase tracking-wider py-0.5 rounded ${
                        p.position === 'GK' ? 'bg-orange-500/15 text-orange-400' :
                        p.position === 'DEF' ? 'bg-sky-500/15 text-sky-400' :
                        p.position === 'MID' ? 'bg-emerald-500/15 text-emerald-400' :
                        'bg-rose-500/15 text-rose-455'
                      }`}>
                        {p.position}
                      </span>
                      <span className="text-white font-extrabold truncate text-xs group-hover:text-sky-400 transition-all">{p.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 font-mono">
                      <div className="flex flex-col items-end">
                        <span className="text-[7px] text-slate-500 font-bold uppercase leading-none">Rating</span>
                        <span className="text-slate-200 font-black text-[10px] mt-0.5">{p.rating}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[7px] text-slate-500 font-bold uppercase leading-none">Stamina</span>
                        <span className={`text-[10px] font-black mt-0.5 ${p.stamina < 55 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                          {Math.round(p.stamina)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-500">
                Need squad rotations, injury treatments, or tactics shifts? Go adjust your lineup inside the <strong className="text-white">Manager Suite</strong> workspace tab.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
