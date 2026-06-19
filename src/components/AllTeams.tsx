import React, { useState } from 'react';
import { Search, Trophy, Shield, Users, Landmark, Award, ArrowRight } from 'lucide-react';
import { Club } from '../types';

interface AllTeamsProps {
  allClubs: Club[];
  onTapClub: (clubId: string) => void;
  userClubId: string;
}

export const AllTeams: React.FC<AllTeamsProps> = ({
  allClubs,
  onTapClub,
  userClubId,
}) => {
  const [teamSearch, setTeamSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState<'ALL' | 'LEAGUE' | 'CUP'>('ALL');

  // Elite league claims the first 20 teams. Cup Draw pool has the remaining 16.
  const leagueTeams = allClubs.slice(0, 20);
  const cupOnlyTeams = allClubs.slice(20, 36);

  const getDivisionLabel = (club: Club) => {
    const idx = allClubs.findIndex(c => c.id === club.id);
    return idx < 20 ? 'Elite SuperLeague' : 'Prestige Draw Pool';
  };

  const getTeamOvrClass = (ovr: number) => {
    if (ovr >= 85) return 'text-[#facc15] font-black';
    if (ovr >= 80) return 'text-sky-400 font-bold';
    return 'text-slate-400';
  };

  const filteredClubs = allClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(teamSearch.toLowerCase()) || 
                          club.coach.name.toLowerCase().includes(teamSearch.toLowerCase());
    
    if (filterDivision === 'ALL') return matchesSearch;
    const isLeagueTeam = allClubs.findIndex(c => c.id === club.id) < 20;
    if (filterDivision === 'LEAGUE') return isLeagueTeam && matchesSearch;
    return !isLeagueTeam && matchesSearch;
  });

  return (
    <div className="space-y-6 select-none animate-fadeIn pb-12">
      
      {/* HEADER CONTROLS CARD */}
      <div className="bg-[#121620] border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400 animate-pulse" />
            Active Football Association Directory ({allClubs.length} Clubs)
          </h2>
          <p className="text-xs text-slate-400">
            Search squads, tactical profiles, executive managers and trigger dossier sheets on any football club.
          </p>
        </div>

        {/* Searching & Filter Selection */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* SEARCH FIELD */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search club name or manager..."
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              className="w-full bg-[#1c2230] border border-white/10 p-2.5 pl-10 rounded-xl text-white text-xs font-semibold focus:border-sky-500 outline-none transition-all"
            />
          </div>

          {/* Division selection pill */}
          <div className="bg-slate-900 border border-white/5 p-1 rounded-xl flex gap-1 text-xs shrink-0 w-full sm:w-auto">
            {(['ALL', 'LEAGUE', 'CUP'] as const).map(pill => (
              <button
                key={pill}
                onClick={() => setFilterDivision(pill)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                  filterDivision === pill ? 'bg-sky-550 text-black font-black font-mono' : 'text-slate-400 hover:text-white'
                }`}
              >
                {pill === 'ALL' ? 'Show All' : pill === 'LEAGUE' ? 'SuperLeague' : 'Cup Pool'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS GRID */}
      {filteredClubs.length === 0 ? (
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-12 text-center text-slate-500 italic text-xs font-mono uppercase">
          No clubs matching search parameters found inside the active association directory.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClubs.map(club => {
            const ovr = Math.round(club.squad.reduce((acc, curr) => acc + curr.rating, 0) / club.squad.length);
            const isUser = club.id === userClubId;

            return (
              <button
                key={club.id}
                id={`allteams-club-grid-${club.id}`}
                onClick={() => onTapClub(club.id)}
                className={`bg-[#121620] border hover:border-sky-500/40 p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group flex flex-col justify-between h-44 relative overflow-hidden ${
                  isUser ? 'ring-1 ring-sky-400 border-sky-400/40 bg-sky-500/[0.02]' : 'border-white/10'
                }`}
              >
                {/* Background ambient accent */}
                <div 
                  className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
                  style={{ backgroundColor: club.color }}
                ></div>

                {/* Top Badge Crest block */}
                <div className="flex justify-between items-start w-full gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow"
                      style={{ backgroundColor: `${club.color}35`, border: `1px solid ${club.color}` }}
                    >
                      {club.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white hover:text-sky-400 transition-all font-black text-sm truncate max-w-[150px] leading-tight flex items-center gap-1.5">
                        {club.name}
                      </h3>
                      <span className="text-[9px] uppercase font-mono font-black text-slate-500 block truncate max-w-[150px] mt-0.5">
                        {getDivisionLabel(club)}
                      </span>
                    </div>
                  </div>
                  
                  {isUser && (
                    <span className="bg-sky-500 text-black text-[7px] uppercase font-black font-mono tracking-widest px-1.5 py-0.5 rounded-full shadow">
                      YOU
                    </span>
                  )}
                </div>

                {/* Tactical Stats readout */}
                <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-2 border border-white/5 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block leading-none">Power rating</span>
                    <span className={`text-[11px] font-black block mt-0.5 ${getTeamOvrClass(ovr)}`}>OVR {ovr}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block leading-none">Mentality</span>
                    <span className="text-slate-200 font-extrabold block text-[10px] mt-0.5 truncate">{club.mentality}</span>
                  </div>
                </div>

                {/* Card Foot action indicator */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider w-full border-t border-white/5 pt-2 mt-2 font-mono">
                  <span>Squad: {club.squad.length} Players</span>
                  <span className="group-hover:text-sky-400 transition-all flex items-center gap-1">
                    Tap Dossier <ArrowRight className="w-3 h-3 group-hover:transform group-hover:translate-x-0.5 transition-all" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
