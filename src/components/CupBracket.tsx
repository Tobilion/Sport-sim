import React, { useState } from 'react';
import { Trophy, Swords } from 'lucide-react';
import { BracketNode, Club } from '../types';

interface CupBracketProps {
  bracket: BracketNode[];
  allClubs: Club[];
  currentRound: string;
  onTapClub?: (clubId: string) => void;
}

export const CupBracket: React.FC<CupBracketProps> = ({
  bracket,
  allClubs,
  currentRound,
  onTapClub
}) => {
  const [selectedRound, setSelectedRound] = useState<'R32' | 'R16' | 'QF' | 'SF' | 'F'>(
    (currentRound === 'Group' || currentRound === 'FINISHED') ? 'R16' : (currentRound as any) || 'R16'
  );

  const getClub = (id?: string) => allClubs.find(c => c.id === id);

  const roundNodes = bracket.filter(n => n.round === selectedRound);

  const getRoundTitle = (round: string) => {
    switch (round) {
      case 'R32': return 'Round of 32 Elimination';
      case 'R16': return 'Round of 16 Knockouts';
      case 'QF': return 'Quarter-Final Combats';
      case 'SF': return 'Semi-Final Showdowns';
      case 'F': return 'Grand Championship Final';
      default: return 'Knockout Stages';
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3.5 items-center">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse shrink-0">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">The Prestige Knockout Cup Bracket</h2>
            <p className="text-xs text-slate-400 mt-1">
              32 clubs compete in direct single-elimination battles. Golden boot awards and massive cash prize pools wait at the summit.
            </p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Active Stage</div>
          <div className="font-mono text-xs font-black text-amber-500 uppercase">{getRoundTitle(currentRound)}</div>
        </div>
      </div>

      <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-white/10 gap-1.5 overflow-x-auto">
        {(['R32', 'R16', 'QF', 'SF', 'F'] as const).map(roundCode => {
          const isActive = selectedRound === roundCode;
          const isCoreActive = currentRound === roundCode;

          return (
            <button
              key={roundCode}
              onClick={() => setSelectedRound(roundCode)}
              className={`flex-1 py-2 text-[10px] md:text-xs uppercase font-black tracking-wider rounded-lg text-center transition-all cursor-pointer truncate min-w-[70px] ${
                isActive 
                  ? 'bg-[#fbbf24] text-[#000]' 
                  : (isCoreActive ? 'bg-white/10 border border-amber-500/50 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5')
              }`}
            >
              {roundCode === 'R32' ? 'R32 (16)' :
               roundCode === 'R16' ? 'R16 (8)' :
               roundCode === 'QF' ? 'QF (4)' :
               roundCode === 'SF' ? 'SF (2)' : 'FINAL'}
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-b from-[#121620] to-[#0c0f16] border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-4 font-mono">
          🏆 Roster fixtures on {getRoundTitle(selectedRound)}
        </h3>

        {roundNodes.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-xs">
            No matches mapped for this stage yet in the bracket tree. Complete prior rounds.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roundNodes.map(node => {
              const home = getClub(node.homeClubId);
              const away = getClub(node.awayClubId);
              
              const isCompleted = node.isCompleted;
              const hasDraw = isCompleted && node.homeScore === node.awayScore;

              return (
                <div 
                  key={node.id} 
                  className={`bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/20 transition-all ${
                    node.isCompleted ? 'opacity-85' : 'ring-1 ring-white/10'
                  }`}
                >
                  <div className="bg-black/20 text-[9px] uppercase tracking-widest font-mono text-slate-500 pb-1 border-b border-white/5 mb-3 flex justify-between">
                    <span>Fixture #{node.id}</span>
                    {node.isCompleted && (
                      <span className="text-[#a3e635] font-bold">COMPLETED RESULT</span>
                    )}
                  </div>

                  <div className="space-y-3 font-medium">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: home?.color || '#334155' }}
                        ></div>
                        <span 
                          onClick={() => home && onTapClub?.(home.id)}
                          className={`text-xs font-bold truncate ${
                            home ? 'cursor-pointer hover:underline hover:text-amber-400' : ''
                          } ${node.winnerClubId === node.homeClubId ? 'text-amber-400 font-extrabold' : 'text-slate-300'}`}
                        >
                          {home?.name || 'TBD Qualifier Slot'}
                        </span>
                      </div>
                      
                      {isCompleted ? (
                        <div className="flex items-center gap-3 font-mono">
                          {hasDraw && (
                            <span className="text-[9px] text-slate-500 font-bold uppercase">({node.homePens} Pens)</span>
                          )}
                          <span className="text-sm font-black text-white">{node.homeScore}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono italic">TO PLAY</span>
                      )}
                    </div>

                    <div className="flex justify-center my-0.5">
                      <Swords className="w-3.5 h-3.5 text-slate-600" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: away?.color || '#334155' }}
                        ></div>
                        <span 
                          onClick={() => away && onTapClub?.(away.id)}
                          className={`text-xs font-bold truncate ${
                            away ? 'cursor-pointer hover:underline hover:text-amber-400' : ''
                          } ${node.winnerClubId === node.awayClubId ? 'text-amber-400 font-extrabold' : 'text-slate-300'}`}
                        >
                          {away?.name || 'TBD Qualifier Slot'}
                        </span>
                      </div>

                      {isCompleted ? (
                        <div className="flex items-center gap-3 font-mono">
                          {hasDraw && (
                            <span className="text-[9px] text-slate-500 font-bold uppercase">({node.awayPens} Pens)</span>
                          )}
                          <span className="text-sm font-black text-white">{node.awayScore}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono italic">TO PLAY</span>
                      )}
                    </div>
                  </div>

                  {isCompleted && node.winnerClubId && (
                    <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Winner: 
                          <strong 
                            onClick={() => onTapClub?.(node.winnerClubId!)}
                            className="text-white ml-1 cursor-pointer hover:underline hover:text-amber-400"
                          >
                            {(getClub(node.winnerClubId))?.name}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 rounded-full font-mono uppercase">ADVANCED</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
