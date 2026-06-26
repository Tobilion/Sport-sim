import React from 'react';
import { Tv, Calendar, Award, CheckCircle2, Play } from 'lucide-react';
import type {
  Club, Fixture, BracketNode, LiveMatchSimulation,
  TeamMentalityType, PlaystyleType, TeamFormationType, Player,
} from '../types';
import { MatchCenter } from '../components/MatchCenter';
import { DUAL_SCHEDULE } from '../data/schedule';

interface Props {
  activeSimulation: LiveMatchSimulation | null;
  allClubs: Club[];
  userClubId: string;
  currentWeek: number;
  campaignType: string;
  fixturesActiveSubTab: 'LEAGUE' | 'TOURNAMENT';
  onSetFixturesTab: (tab: 'LEAGUE' | 'TOURNAMENT') => void;
  leagueFixtures: Fixture[];
  tournamentFixtures: Fixture[];
  cupBracket: BracketNode[];
  currentCupRound: string;
  currentActiveUserClub: Club;
  activeMatchesToPlay: (Fixture | BracketNode)[];
  isPlaying: boolean;
  simSpeed: number;
  onSkipOrQuickSim: () => void;
  onAdvanceCampaignWeek: () => void;
  onSimulateAllRemainingMatches: () => void;
  onInitiateLiveSimulation: (id: string, homeId: string, awayId: string, spectating: boolean) => void;
  onProgressSimOneTick: () => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onTacticalShift: (m: TeamMentalityType) => void;
  onPlaystyleShift: (p: PlaystyleType) => void;
  onFormationShift: (f: TeamFormationType) => void;
  onOpenPlayerDossier: (id: string) => void;
  onOpenClubDossier: (id: string) => void;
  onAdjustSquadLineup: (squad: Player[]) => void;
  onCloseMatch: () => void;
}

export function FixturesPage({
  activeSimulation, allClubs, userClubId, currentWeek, campaignType,
  fixturesActiveSubTab, onSetFixturesTab, leagueFixtures, tournamentFixtures,
  cupBracket, currentCupRound, currentActiveUserClub, activeMatchesToPlay,
  isPlaying, simSpeed, onSkipOrQuickSim, onAdvanceCampaignWeek,
  onSimulateAllRemainingMatches, onInitiateLiveSimulation, onProgressSimOneTick,
  onTogglePlay, onSetSpeed, onTacticalShift, onPlaystyleShift, onFormationShift,
  onOpenPlayerDossier, onOpenClubDossier, onAdjustSquadLineup, onCloseMatch,
}: Props) {
  const weekInfo = DUAL_SCHEDULE.find(s => s.week === currentWeek);
  const isLeagueWeek = weekInfo ? weekInfo.type === 'league' : true;

  if (activeSimulation) {
    return (
      <div className="space-y-4">
        <div className="bg-[#121620] border border-white/10 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs leading-none">
          <span className="text-slate-400 font-bold uppercase tracking-wider block">
            Want to instantly simulate results? Complete this game with a single tap:
          </span>
          <button
            onClick={onSkipOrQuickSim}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-black font-extrabold uppercase rounded-lg cursor-pointer text-[10px] tracking-wider transition-all"
          >
            Instant Simulated Match Result
          </button>
        </div>
        <MatchCenter
          simulation={activeSimulation}
          homeClub={allClubs.find(c => c.id === activeSimulation.homeClubId)!}
          awayClub={allClubs.find(c => c.id === activeSimulation.awayClubId)!}
          isPlaying={isPlaying}
          simSpeed={simSpeed}
          onTogglePlay={onTogglePlay}
          onStepSimulation={onProgressSimOneTick}
          onSetSpeed={onSetSpeed}
          onChangeUserMentality={onTacticalShift}
          onChangeUserPlaystyle={onPlaystyleShift}
          onChangeUserFormation={onFormationShift}
          userClubId={userClubId}
          onTapPlayer={onOpenPlayerDossier}
          onTapClub={onOpenClubDossier}
          onAdjustSquadLineup={onAdjustSquadLineup}
          onCloseMatch={onCloseMatch}
        />
      </div>
    );
  }

  // No active simulation — show fixture list
  return (
    <div className="max-w-4xl mx-auto bg-[#121620] border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-md font-black text-white uppercase tracking-tight">Campaign Fixtures & Broadcast Deck</h2>
            <p className="text-xs text-slate-400">Launch real-time interactive match servers. Manage user matchday lineups, or spectate any CPU fixture live!</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-xl font-mono text-center shrink-0">
          <span className="text-[9px] uppercase text-slate-500 block leading-none font-bold">CURRENT CAMPAIGN ROUND</span>
          <span className="text-xs font-black text-sky-400 uppercase mt-1 block">WEEK {currentWeek} / 26</span>
        </div>
      </div>

      {/* Sub-tab switcher for dual campaigns */}
      {campaignType === 'dual' && (
        <div className="flex gap-2 p-1 bg-slate-950/80 border border-white/5 rounded-xl w-fit">
          {(['LEAGUE', 'TOURNAMENT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onSetFixturesTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                fixturesActiveSubTab === tab
                  ? tab === 'LEAGUE' ? 'bg-sky-500 text-black shadow font-extrabold' : 'bg-amber-500 text-black shadow font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'LEAGUE' ? 'League Matchdays' : 'Prestige Cup'}
            </button>
          ))}
        </div>
      )}

      {/* All-complete state */}
      {activeMatchesToPlay.length === 0 ? (
        <div className="p-8 text-center space-y-4">
          <div className="py-5 bg-black/40 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce mb-1" />
            <span>All fixtures completed for this session round!</span>
          </div>
          <button
            onClick={onAdvanceCampaignWeek}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow"
          >
            Advance to Week {currentWeek + 1}
          </button>
        </div>
      ) : campaignType === 'dual' && fixturesActiveSubTab === 'LEAGUE' && !isLeagueWeek ? (
        <OffWeekNotice
          color="sky"
          icon={<Calendar className="w-6 h-6" />}
          title="No League Fixtures Scheduled"
          message={`Week ${currentWeek} is designated for the Prestige Champions Cup tournament stage.`}
          next={findNextUserFixture(leagueFixtures, currentActiveUserClub.id, allClubs, 'league')}
          hint={<>Select the <strong className="text-amber-400">Prestige Cup</strong> sub-tab above to play tournament fixtures of the week!</>}
        />
      ) : campaignType === 'dual' && fixturesActiveSubTab === 'TOURNAMENT' && isLeagueWeek ? (
        <OffWeekNotice
          color="amber"
          icon={<Award className="w-6 h-6 animate-pulse" />}
          title="No Prestige Cup Fixtures Scheduled"
          message={`Week ${currentWeek} is designated for local Elite SuperLeague league matches.`}
          next={findNextUserCupMatch(tournamentFixtures, cupBracket, currentActiveUserClub.id, allClubs, DUAL_SCHEDULE)}
          hint={<>Select the <strong className="text-sky-400">League Matchdays</strong> sub-tab above to play league fixtures of the week!</>}
        />
      ) : (
        <MatchList
          matches={activeMatchesToPlay}
          allClubs={allClubs}
          userClubId={userClubId}
          onInitiateLiveSimulation={onInitiateLiveSimulation}
          onSimulateAll={onSimulateAllRemainingMatches}
          campaignType={campaignType}
          currentWeek={currentWeek}
        />
      )}
    </div>
  );
}

// ─── Helper sub-components ───────────────────────────────────────────────────

interface OffWeekNoticeProps {
  color: 'sky' | 'amber';
  icon: React.ReactNode;
  title: string;
  message: string;
  next: { opponentName: string; weekLabel: string } | null;
  hint: React.ReactNode;
}

function OffWeekNotice({ color, icon, title, message, next, hint }: OffWeekNoticeProps) {
  const accent = color === 'sky' ? 'sky' : 'amber';
  return (
    <div className="bg-[#121620] border border-white/5 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
      <div className={`w-12 h-12 bg-${accent}-500/10 text-${accent}-400 rounded-xl flex items-center justify-center mx-auto border border-${accent}-400/20`}>
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        {next ? (
          <div className={`my-4 bg-${accent}-500/10 border border-${accent}-500/20 p-4 rounded-xl text-left inline-block min-w-48`}>
            <span className={`text-[10px] text-${accent}-400 font-mono uppercase font-black block mb-1 tracking-widest`}>
              Next {color === 'sky' ? 'League' : 'Cup'} Match:
            </span>
            <div className="text-white text-sm font-black uppercase tracking-tight">vs {next.opponentName}</div>
            <div className="text-xs text-slate-400 mt-1">Scheduled for <strong className="text-white">{next.weekLabel}</strong></div>
          </div>
        ) : (
          <div className="my-4 text-xs text-slate-500 bg-white/5 p-3 rounded-xl border border-white/10 uppercase tracking-widest font-mono font-bold">
            No Upcoming Matches
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4 block">{hint}</p>
      </div>
    </div>
  );
}

interface MatchListProps {
  matches: (Fixture | BracketNode)[];
  allClubs: Club[];
  userClubId: string;
  onInitiateLiveSimulation: (id: string, homeId: string, awayId: string, spectating: boolean) => void;
  onSimulateAll: () => void;
  campaignType: string;
  currentWeek: number;
}

function MatchList({ matches, allClubs, userClubId, onInitiateLiveSimulation, onSimulateAll, campaignType, currentWeek }: MatchListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-900/[0.45] border border-white/5 p-4 rounded-2xl">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-black block">
            Scheduled matches this week ({campaignType === 'league' || (campaignType === 'dual' && currentWeek % 2 !== 0) ? 'League Matchday' : 'Prestige Champions Cup'}):
          </span>
          <span className="text-[9px] text-[#22c55e] font-mono uppercase bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20 inline-block font-bold">
            {matches.length} matches pending
          </span>
        </div>
        <button
          onClick={onSimulateAll}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-450 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
        >
          Simulate All Matches
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map(match => {
          const h = allClubs.find(c => c.id === match.homeClubId)!;
          const a = allClubs.find(c => c.id === match.awayClubId)!;
          if (!h || !a) return null;
          const isUserGame = h.id === userClubId || a.id === userClubId;
          const avg = (club: Club) => Math.round(club.squad.reduce((s, p) => s + p.rating, 0) / (club.squad.length || 1));
          return (
            <div key={match.id} className={`p-4 rounded-2xl flex flex-col justify-between border transition-all relative overflow-hidden ${
              isUserGame ? 'bg-sky-500/[0.03] border-sky-400/30' : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}>
              {isUserGame && <span className="absolute top-2 right-2 bg-sky-500 text-black text-[7px] font-black font-mono tracking-widest px-1.5 py-0.5 rounded-full z-10">YOUR GAME</span>}
              <div className="space-y-3 mb-4">
                {[{ club: h, id: userClubId }, { club: a, id: userClubId }].map(({ club }, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 max-w-[170px]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: club.color }} />
                      <span className={`font-black truncate cursor-pointer hover:underline hover:text-sky-450 ${club.id === userClubId ? 'text-sky-400' : 'text-slate-200'}`}>
                        {club.name}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[10px]">OVR {avg(club)}</span>
                  </div>
                ))}
              </div>
              {isUserGame ? (
                <button
                  onClick={() => onInitiateLiveSimulation(match.id, h.id, a.id, false)}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-black text-[10px] tracking-wider uppercase font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-black" /> COACH YOUR CLUB
                </button>
              ) : (
                <button
                  onClick={() => onInitiateLiveSimulation(match.id, h.id, a.id, true)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-[10px] tracking-wider uppercase font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-slate-400" /> Spectate Live Broadcast
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────

function findNextUserFixture(
  fixtures: Fixture[],
  userClubId: string,
  allClubs: Club[],
  _type: string,
): { opponentName: string; weekLabel: string } | null {
  const next = fixtures.find(f => !f.isCompleted && (f.homeClubId === userClubId || f.awayClubId === userClubId));
  if (!next) return null;
  const oppId = next.homeClubId === userClubId ? next.awayClubId : next.homeClubId;
  return { opponentName: allClubs.find(c => c.id === oppId)?.name || 'Unknown', weekLabel: `Week ${next.week}` };
}

function findNextUserCupMatch(
  tournamentFixtures: Fixture[],
  cupBracket: BracketNode[],
  userClubId: string,
  allClubs: Club[],
  schedule: typeof DUAL_SCHEDULE,
): { opponentName: string; weekLabel: string } | null {
  const nextGroup = tournamentFixtures.find(f => !f.isCompleted && (f.homeClubId === userClubId || f.awayClubId === userClubId));
  const nextKnock = cupBracket.find(n => !n.isCompleted && (n.homeClubId === userClubId || n.awayClubId === userClubId));
  const combined = nextGroup || nextKnock;
  if (!combined) return null;
  const oppId = combined.homeClubId === userClubId ? combined.awayClubId : combined.homeClubId;
  const opponentName = allClubs.find(c => c.id === oppId)?.name || 'TBD';
  let weekLabel = 'TBD';
  if ('week' in combined) {
    weekLabel = `Week ${(combined as Fixture).week}`;
  } else {
    const info = schedule.find(s => s.stage === (combined as BracketNode).round);
    if (info) weekLabel = `Week ${info.week}`;
  }
  return { opponentName, weekLabel };
}
