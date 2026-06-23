import React, { useState } from 'react';
import { Award, Calendar, Trophy, Medal, ChevronLeft, ChevronRight, Landmark, Swords, Shield, Play } from 'lucide-react';
import { Club, Fixture, BracketNode } from '../types';
import { getGroupStandingsForGroup } from '../App'; // If needed, we can also write the logic inline to be safe
import { CupBracket } from './CupBracket';

interface LeagueTableProps {
  allClubs: Club[];
  fixtures: Fixture[];
  currentWeek: number;
  userClubId: string;
  onTapPlayer?: (playerId: string) => void;
  onTapClub?: (clubId: string) => void;
  tournamentFixtures?: Fixture[];
  cupBracket?: BracketNode[];
  currentCupRound?: 'Group' | 'R16' | 'QF' | 'SF' | 'F' | 'FINISHED' | 'R32' | any;
  onAdvanceWeek?: () => void;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
  allClubs,
  fixtures,
  currentWeek,
  userClubId,
  onTapPlayer,
  onTapClub,
  tournamentFixtures = [],
  cupBracket = [],
  currentCupRound = 'Group',
  onAdvanceWeek
}) => {
  const [standingsTab, setStandingsTab] = useState<'LEAGUE' | 'CUP'>('LEAGUE');
  const [cupSubTab, setCupSubTab] = useState<'GROUPS' | 'BRACKET'>('GROUPS');
  const [selectedWeekTab, setSelectedWeekTab] = useState<number>(currentWeek);

  const getClub = (id: string) => allClubs.find(c => c.id === id);

  const sortedLeagueStandings = [...allClubs].slice(0, 20).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.won - a.won;
  });

  const weekFixtures = fixtures.filter(f => f.week === selectedWeekTab);
  const totalWeeks = 19; // 20 teams = 19 rounds

  // Helper to re-calculate Group standings safely
  const calculateGroupStandings = (groupIndex: number): any[] => {
    const groupTeams = allClubs.slice(groupIndex * 4, groupIndex * 4 + 4);
    const standings = groupTeams.map(club => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;

      tournamentFixtures.forEach(f => {
        if (!f.isCompleted) return;
        if (f.homeClubId === club.id) {
          played++;
          goalsFor += f.homeScore || 0;
          goalsAgainst += f.awayScore || 0;
          if ((f.homeScore || 0) > (f.awayScore || 0)) {
            won++; points += 3;
          } else if ((f.homeScore || 0) < (f.awayScore || 0)) {
            lost++;
          } else {
            drawn++; points += 1;
          }
        } else if (f.awayClubId === club.id) {
          played++;
          goalsFor += f.awayScore || 0;
          goalsAgainst += f.homeScore || 0;
          if ((f.awayScore || 0) > (f.homeScore || 0)) {
            won++; points += 3;
          } else if ((f.awayScore || 0) < (f.homeScore || 0)) {
            lost++;
          } else {
            drawn++; points += 1;
          }
        }
      });

      return {
        club, played, won, drawn, lost, goalsFor, goalsAgainst,
        goalDifference: goalsFor - goalsAgainst, points
      };
    });

    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn pb-12">
      
      {/* SELECTION TAB WORKSPACE IN STANDINGS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121620] border border-white/10 p-5 rounded-2xl">
        <div className="space-y-0.5">
          <h2 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
            League & Brackets Standings Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Monitor real-time league table statistics, Champions Cup points, and knockout stages qualifiers.
          </p>
        </div>

        {/* Dual primary selector */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-white/10 p-1 rounded-xl flex gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setStandingsTab('LEAGUE')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                standingsTab === 'LEAGUE' ? 'bg-sky-500 text-black font-black font-mono' : 'text-slate-400 hover:text-white'
              }`}
            >
              Elite SuperLeague Table
            </button>
            <button
              onClick={() => setStandingsTab('CUP')}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                standingsTab === 'CUP' ? 'bg-amber-500 text-black font-black font-mono' : 'text-slate-400 hover:text-white'
              }`}
            >
              Prestige Cup draw
            </button>
          </div>

          {/* ADVANCE SCHEDULE ACTION BUTTON */}
          {onAdvanceWeek && (
            <button
              id="standings-advance-btn"
              onClick={onAdvanceWeek}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] uppercase font-black tracking-wider rounded-xl cursor-pointer shadow flex items-center gap-1 hover:scale-[1.03] transition-all"
            >
              Advance Week
            </button>
          )}
        </div>
      </div>

      {/* VIEW RENDER SPLIT */}
      {standingsTab === 'LEAGUE' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEAGUE TABLE */}
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 xl:col-span-2 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-sky-400" />
                  Elite SuperLeague Table
                </h3>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-400/20 font-mono font-bold">
                  WEEK {currentWeek} / 26
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[8px] uppercase tracking-widest text-[#94a3b8] font-mono leading-none pb-2">
                      <th className="py-2 text-center w-8">POS</th>
                      <th className="py-2">CLUB</th>
                      <th className="py-2 text-center w-10 font-bold hidden sm:table-cell">PL</th>
                      <th className="py-2 text-center w-10 text-emerald-400 hidden sm:table-cell">W</th>
                      <th className="py-2 text-center w-10 text-slate-400 hidden sm:table-cell">D</th>
                      <th className="py-2 text-center w-10 text-rose-455 hidden sm:table-cell">L</th>
                      <th className="py-2 text-center w-12 text-slate-500 hidden md:table-cell">GF:GA</th>
                      <th className="py-2 text-center w-10 hidden md:table-cell">GD</th>
                      <th className="py-2 text-center w-12 bg-sky-500/5 font-black text-sky-450">PTS</th>
                      <th className="py-2 text-center hidden lg:table-cell">STREAK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {sortedLeagueStandings.map((club, idx) => {
                      const position = idx + 1;
                      const isUser = club.id === userClubId;

                      return (
                        <tr 
                          key={club.id} 
                          className={`hover:bg-white/5 transition-all ${
                            isUser ? 'bg-sky-505/[0.04] border-l-2 border-l-sky-400 font-bold' : ''
                          }`}
                        >
                          <td className="py-2.5 text-center">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[9px] font-mono ${
                              position === 1 ? 'bg-amber-500 text-black shadow' :
                              position <= 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                              position >= 18 ? 'bg-rose-500/10 text-rose-450 border border-rose-500/15' :
                              'text-slate-400'
                            }`}>
                              {position}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2 max-w-[170px]">
                              <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: club.color }}
                              ></div>
                              <span 
                                onClick={() => onTapClub?.(club.id)}
                                className={`truncate text-xs cursor-pointer hover:underline hover:text-sky-400 transition-all ${isUser ? 'text-sky-400 font-extrabold' : 'text-slate-200'}`}
                              >
                                {club.name} {isUser && '(YOU)'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-center font-mono text-slate-300 hidden sm:table-cell">{club.played}</td>
                          <td className="py-2.5 text-center font-mono text-emerald-400 hidden sm:table-cell">{club.won}</td>
                          <td className="py-2.5 text-center font-mono text-slate-400 hidden sm:table-cell">{club.drawn}</td>
                          <td className="py-2.5 text-center font-mono text-rose-455 hidden sm:table-cell">{club.lost}</td>
                          <td className="py-2.5 text-center font-mono text-slate-550 hidden md:table-cell">
                            {club.goalsFor}:{club.goalsAgainst}
                          </td>
                          <td className={`py-2.5 text-center font-mono font-bold hidden md:table-cell ${
                            club.goalDifference > 0 ? 'text-emerald-400' : (club.goalDifference < 0 ? 'text-rose-455' : 'text-slate-500')
                          }`}>
                            {club.goalDifference > 0 ? `+${club.goalDifference}` : club.goalDifference}
                          </td>
                          <td className={`py-2.5 text-center font-mono font-black text-xs bg-sky-500/5 ${isUser ? 'text-sky-400' : 'text-white'}`}>
                            {club.points}
                          </td>
                          <td className="py-2.5 hidden lg:table-cell">
                            <div className="flex gap-1 justify-center">
                              {club.streak.slice(-5).map((outcome, oidx) => (
                                <span 
                                  key={oidx} 
                                  className={`w-4 h-4 rounded text-[8px] font-black flex items-center justify-center font-mono ${
                                    outcome === 'W' ? 'bg-emerald-500 text-black' :
                                    outcome === 'D' ? 'bg-slate-700 text-slate-300' :
                                    'bg-rose-500 text-black'
                                  }`}
                                >
                                  {outcome}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-4 text-center">
              The top 4 positions qualify into the adjacent year's Prestige Champions Cup. Bottom 3 clubs undergo relegation evaluation.
            </div>
          </div>

          {/* RIGHT SIDE: LEAGUE WEEK FIXTURES SELECTOR */}
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  SuperLeague Weekly Fixtures
                </h3>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedWeekTab(Math.max(1, selectedWeekTab - 1))}
                    disabled={selectedWeekTab <= 1}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono font-black text-slate-200">WK {selectedWeekTab}</span>
                  <button 
                    onClick={() => setSelectedWeekTab(Math.min(totalWeeks, selectedWeekTab + 1))}
                    disabled={selectedWeekTab >= totalWeeks}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {weekFixtures.map(fix => {
                  const h = getClub(fix.homeClubId);
                  const a = getClub(fix.awayClubId);
                  if (!h || !a) return null;

                  return (
                    <div 
                      key={fix.id} 
                      className={`p-2 bg-slate-900/50 border border-white/5 rounded-xl text-xs space-y-1 hover:border-white/10 transition-all ${
                        fix.isCompleted ? 'opacity-85' : 'ring-1 ring-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[8px] text-slate-550 border-b border-white/5 pb-1 mb-1">
                        <span>Fixture #{fix.id}</span>
                        {fix.isCompleted ? (
                          <span className="text-emerald-400 font-bold uppercase">Result Full</span>
                        ) : (
                          <span className="text-slate-655 font-bold uppercase">Scheduled</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="truncate max-w-[150px] font-sans">
                          <span 
                            onClick={() => onTapClub?.(h.id)}
                            className="font-extrabold hover:underline cursor-pointer text-slate-205"
                          >
                            {h.name}
                          </span>
                        </div>
                        <span className="font-mono text-white text-xs font-black">
                          {fix.isCompleted ? fix.homeScore : '-'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="truncate max-w-[150px] font-sans">
                          <span 
                            onClick={() => onTapClub?.(a.id)}
                            className="font-extrabold hover:underline cursor-pointer text-slate-205"
                          >
                            {a.name}
                          </span>
                        </div>
                        <span className="font-mono text-white text-xs font-black">
                          {fix.isCompleted ? fix.awayScore : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[9px] text-[#94a3b8] mt-4 pt-3 border-t border-white/5 flex justify-between uppercase font-mono">
              <span>Fixtures: {weekFixtures.length} Rounds</span>
              <span className="text-[#38bdf8]">Wk {currentWeek} in play</span>
            </div>
          </div>

        </div>
      ) : (
        /* CHAMPIONS CUP DECK (GROUPS OR BRACKET) */
        <div className="space-y-6">
          {/* Sub tabs in Cup display */}
          <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl gap-1 text-xs max-w-sm">
            <button
              onClick={() => setCupSubTab('GROUPS')}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-lg text-center transition-all cursor-pointer ${
                cupSubTab === 'GROUPS' ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Group Standings (A-H)
            </button>
            <button
              onClick={() => setCupSubTab('BRACKET')}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-[#fff] font-extrabold rounded-lg text-center transition-all cursor-pointer ${
                cupSubTab === 'BRACKET' ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Knockout Bracket Tree
            </button>
          </div>

          {cupSubTab === 'GROUPS' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, gIdx) => {
                const char = String.fromCharCode(65 + gIdx);
                const groupStandings = calculateGroupStandings(gIdx);

                return (
                  <div key={gIdx} className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-tight">Group {char}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">Prestige Draw</span>
                    </div>

                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-[8px] text-slate-500 uppercase font-mono pb-1">
                          <th className="py-1">CLUB</th>
                          <th className="py-1 text-center w-8">PL</th>
                          <th className="py-1 text-center w-8">GD</th>
                          <th className="py-1 text-center w-8 font-black text-amber-500">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {groupStandings.map((row, rIdx) => {
                          const isUser = row.club.id === userClubId;
                          return (
                            <tr key={row.club.id} className={`${isUser ? 'bg-amber-500/10 font-bold border-l border-l-amber-500' : ''}`}>
                              <td className="py-1.5 truncate max-w-[90px]">
                                <span 
                                  onClick={() => onTapClub?.(row.club.id)}
                                  className="cursor-pointer hover:underline text-slate-200 hover:text-amber-400"
                                >
                                  {row.club.name}
                                </span>
                              </td>
                              <td className="py-1.5 text-center font-mono text-slate-400">{row.played}</td>
                              <td className="py-1.5 text-center font-mono text-slate-400">
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </td>
                              <td className={`py-1.5 text-center font-mono font-black ${isUser ? 'text-amber-400' : 'text-white'}`}>
                                {row.points}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="text-[8px] text-slate-550 italic text-center font-mono">
                      Top 2 qualify to Round of 16 Brackets
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <CupBracket
              bracket={cupBracket}
              allClubs={allClubs}
              currentRound={currentCupRound}
              onTapClub={onTapClub}
            />
          )}
        </div>
      )}

    </div>
  );
};
