import React from 'react';
import { Trophy, Star, ShieldAlert, Award } from 'lucide-react';
import { TrophyRecord } from '../types';

interface TrophiesCenterProps {
  historyTrophies: TrophyRecord[];
}

export const TrophiesCenter: React.FC<TrophiesCenterProps> = ({ historyTrophies }) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 p-6 md:p-8">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none">
          <Trophy className="w-64 h-64 text-yellow-400 font-black" />
        </div>
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-black text-[9px] uppercase tracking-wider">
              Cabinet of Glory
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Trophy Hall of Fame</h2>
          <p className="text-xs text-slate-400 leading-relaxed md:max-w-xl">
            A permanent historical register commemorating absolute champions, clinical golden boot strikers, and wall-like golden glove goalkeepers across the ages.
          </p>
        </div>
      </div>

      {/* Historical List */}
      {historyTrophies.length === 0 ? (
        <div className="bg-[#121620] border border-white/5 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
            <Trophy className="w-8 h-8 text-slate-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Mahogany Trophy Cabinet Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Your cabinet is presently pristine but bare. Dominate either the Elite SuperLeague or Prestige Champions Cup to engrave your name in history!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historyTrophies.map((rec) => (
            <div 
              key={rec.season} 
              className="bg-[#121620] border border-white/10 rounded-2xl p-5 hover:border-amber-500/25 transition-all space-y-4 shadow"
            >
              {/* Season Header Banner */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-black uppercase text-amber-400 font-mono tracking-widest bg-amber-500/10 px-3 py-1 rounded">
                  Season {rec.season} Champions
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                  ARCHIVED RECORDED
                </span>
              </div>

              {/* Major Team Trophies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* League Champion */}
                <div className="bg-black/20 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-505/10 flex items-center justify-center shrink-0 border border-sky-500/20">
                    <Trophy className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-wider block">Elite League Winner</span>
                    <strong className="text-xs text-white block mt-0.5" style={{ color: rec.leagueWinnerColor || '#3abdf8' }}>
                      {rec.leagueWinner}
                    </strong>
                  </div>
                </div>

                {/* Cup Champion */}
                <div className="bg-black/20 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-505/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                    <Star className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-wider block">Prestige Champions Crown</span>
                    <strong className="text-xs text-white block mt-0.5" style={{ color: rec.tournamentWinnerColor || '#facc15' }}>
                      {rec.tournamentWinner}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Individual Accomplishments */}
              <div className="pt-3 border-t border-white/5 space-y-2.5">
                <span className="text-[9px] text-slate-400 uppercase font-mono font-black tracking-widest block">Individual Accolade Awards</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Golden Boot */}
                  <div className="flex items-start gap-2 bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                    <Award className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider block">Golden Boot Recipient</span>
                      <strong className="text-xs text-slate-200 mt-0.5 block truncate leading-none">
                        {rec.goldenBootName}
                      </strong>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                        {rec.goldenBootClub} • <strong className="text-emerald-400">{rec.goldenBootGoals} Goals</strong>
                      </span>
                    </div>
                  </div>

                  {/* Golden Glove */}
                  <div className="flex items-start gap-2 bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                    <Award className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider block">Golden Glove Recipient</span>
                      <strong className="text-xs text-slate-200 mt-0.5 block truncate leading-none">
                        {rec.goldenGloveName}
                      </strong>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                        {rec.goldenGloveClub} • <strong className="text-orange-400">{rec.goldenGloveSaves} Saves</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
