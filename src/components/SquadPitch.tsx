import React, { useState } from 'react';
import { Player, TeamMentalityType, TeamFormationType } from '../types';
import { MoveRight, Info, AlertTriangle } from 'lucide-react';

interface SquadPitchProps {
  squad: Player[];
  mentality: TeamMentalityType;
  formation: TeamFormationType;
  onSwapPlayers?: (starterId: string, benchId: string) => void;
  onTapPlayer?: (playerId: string) => void;
  clubColor: string;
}

export const SquadPitch: React.FC<SquadPitchProps> = ({ squad, mentality, formation, onSwapPlayers, onTapPlayer, clubColor }) => {
  const [selectedStarterId, setSelectedStarterId] = useState<string | null>(null);
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<'SWAP' | 'INFO'>('SWAP');

  const starters = squad.filter(p => p.isStarting);
  const bench = squad.filter(p => !p.isStarting);

  const handlePlayerClick = (player: Player) => {
    if (interactionMode === 'INFO') {
      onTapPlayer?.(player.id);
      return;
    }

    if (player.isStarting) {
      if (selectedStarterId === player.id) {
        setSelectedStarterId(null);
      } else {
        setSelectedStarterId(player.id);
        if (selectedBenchId && onSwapPlayers) {
          onSwapPlayers(player.id, selectedBenchId);
          setSelectedStarterId(null);
          setSelectedBenchId(null);
        }
      }
    } else {
      if (selectedBenchId === player.id) {
        setSelectedBenchId(null);
      } else {
        setSelectedBenchId(player.id);
        if (selectedStarterId && onSwapPlayers) {
          onSwapPlayers(selectedStarterId, player.id);
          setSelectedStarterId(null);
          setSelectedBenchId(null);
        }
      }
    }
  };

  const getPositionRow = (position: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    switch (position) {
      case 'GK': return 90;
      case 'DEF': return 70;
      case 'MID': return 45;
      case 'ATT': return 20;
    }
  };

  // Parse formation
  const formationParts = formation.split('-').map(Number);
  const requiredDEF = formationParts[0] || 4;
  const requiredMID = formationParts[1] || 3;
  const requiredATT = formationParts[2] || 3;
  const is532 = formation === '5-3-2';
  const is4231 = formation === '4-2-3-1'; // Technically 4-5-1 in 3 bands, we can map to DEF:4, MID:5, ATT:1

  const defCount = requiredDEF;
  const midCount = is4231 ? 5 : requiredMID;
  const attCount = is4231 ? 1 : requiredATT;

  // Smart Layout Generator
  let allocatedGK: Player[] = [];
  let allocatedDEF: Player[] = [];
  let allocatedMID: Player[] = [];
  let allocatedATT: Player[] = [];

  const unallocated = [...starters];

  const tryFill = (pool: Player[], pos: 'GK'|'DEF'|'MID'|'ATT', limit: number) => {
    for (let i = unallocated.length - 1; i >= 0; i--) {
      if (pool.length < limit && unallocated[i].position === pos) {
        pool.push(unallocated.splice(i, 1)[0]);
      }
    }
  };

  tryFill(allocatedGK, 'GK', 1);
  tryFill(allocatedDEF, 'DEF', defCount);
  tryFill(allocatedMID, 'MID', midCount);
  tryFill(allocatedATT, 'ATT', attCount);

  const forceFill = (pool: Player[], limit: number) => {
    while (pool.length < limit && unallocated.length > 0) {
      pool.push(unallocated.pop()!);
    }
  };

  forceFill(allocatedGK, 1);
  forceFill(allocatedDEF, defCount);
  forceFill(allocatedMID, midCount);
  forceFill(allocatedATT, attCount);

  const groupedStarters = {
    GK: allocatedGK,
    DEF: allocatedDEF,
    MID: allocatedMID,
    ATT: allocatedATT
  };

  const renderStarter = (player: Player, index: number, totalInRow: number, rowPos: 'GK'|'DEF'|'MID'|'ATT') => {
    const yOffset = getPositionRow(rowPos);
    let xOffset = 50; 
    if (totalInRow > 1) {
      xOffset = ((index + 1) / (totalInRow + 1)) * 100;
      
      if (mentality === 'Park the Bus' && rowPos !== 'GK') {
         if (xOffset < 50) xOffset += 5;
         if (xOffset > 50) xOffset -= 5;
      }
      if (mentality === 'Gegenpressing' && rowPos !== 'GK') {
         if (xOffset < 50) xOffset -= 5;
         if (xOffset > 50) xOffset += 5;
      }
    }

    const isSelected = selectedStarterId === player.id;
    const isOutOfPosition = player.position !== rowPos;

    return (
      <div 
        key={player.id}
        onClick={() => handlePlayerClick(player)}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'}`}
        style={{ top: `${yOffset}%`, left: `${xOffset}%` }}
      >
        <div 
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center shadow-lg border-2 relative ${isSelected ? 'border-amber-400 rotate-12' : 'border-white/20'}`}
          style={{ backgroundColor: clubColor }}
        >
          {isOutOfPosition && (
            <div className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white border border-black shadow">
              <AlertTriangle className="w-2.5 h-2.5" />
            </div>
          )}
          <span className="text-[9px] font-black text-white uppercase">{player.position}</span>
          <span className="text-[10px] font-mono text-white/90 font-bold">{player.rating}</span>
        </div>
        <div className={`mt-1 text-[10px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap overflow-hidden max-w-[60px] text-ellipsis ${isSelected ? 'bg-amber-400 text-black' : isOutOfPosition ? 'bg-red-500/80 text-white' : 'bg-black/80 text-white'}`}>
          {player.name.split(' ')[player.name.split(' ').length - 1]}
        </div>
        
        <div className="w-8 h-1 bg-black/60 rounded-full mt-0.5 overflow-hidden">
          <div className="h-full" style={{ width: `${player.stamina}%`, backgroundColor: player.stamina < 60 ? '#f43f5e' : '#10b981' }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setInteractionMode('SWAP')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
              interactionMode === 'SWAP' ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <MoveRight className="w-3.5 h-3.5" />
            Make Subs
          </button>
          <button
            onClick={() => setInteractionMode('INFO')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
              interactionMode === 'INFO' ? 'bg-sky-400 text-black shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Vitals Info
          </button>
        </div>
        <div className="text-[10px] font-mono text-slate-400 flex flex-col items-end">
          <span className="uppercase text-white font-bold tracking-widest">{formation} Structure</span>
        </div>
      </div>

      <div className="w-full relative h-[450px] md:h-[500px] bg-gradient-to-t from-[#09150e] to-[#0d2a1a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4">
        {/* Grass Stripes Pattern */}
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.03]">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className={`flex-1 w-full ${idx % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} />
          ))}
        </div>

        {/* Pitch Lines */}
        <div className="absolute inset-4 border-2 border-white/10 rounded-sm pointer-events-none">
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2"></div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Penalty boxes */}
          <div className="absolute bottom-0 left-1/2 w-[40%] h-[15%] border-t-2 border-x-2 border-white/10 -translate-x-1/2"></div>
          <div className="absolute top-0 left-1/2 w-[40%] h-[15%] border-b-2 border-x-2 border-white/10 -translate-x-1/2"></div>
        </div>

        {/* Render Starters */}
        {(['GK', 'DEF', 'MID', 'ATT'] as const).map(pos => (
          <React.Fragment key={pos}>
            {groupedStarters[pos].map((player, idx) => 
               renderStarter(player, idx, groupedStarters[pos].length, pos)
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bench */}
      <div className="bg-[#121620] border border-white/10 rounded-2xl p-4">
        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest border-b border-white/5 pb-2">Substitutes Bench</h4>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {bench.map(player => {
             const isSelected = selectedBenchId === player.id;
             return (
               <div 
                 key={player.id} 
                 onClick={() => handlePlayerClick(player)}
                 className={`flex-shrink-0 min-w-[100px] flex flex-col items-center bg-[#1c2230] rounded-xl p-3 border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-sky-400 bg-sky-500/10 scale-105' : 'border-white/5 hover:border-white/20'}`}
               >
                 <span className={`px-2 py-0.5 rounded text-[9px] font-black mb-2 ${
                    player.position === 'GK' ? 'bg-orange-500/20 text-orange-400' :
                    player.position === 'DEF' ? 'bg-sky-500/20 text-sky-400' :
                    player.position === 'MID' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-rose-500/20 text-rose-450'
                 }`}>{player.position}</span>
                 <div className="text-sm font-bold text-white max-w-[80px] truncate text-center mb-1 bg-black/40 px-1 py-0.5 rounded leading-tight h-10 flex items-center justify-center">
                   {player.name}
                 </div>
                 <div className="flex gap-2 items-center text-[10px] font-mono mb-2">
                   <div className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">OVR {player.rating}</div>
                 </div>
                 <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full" style={{ width: `${player.stamina}%`, backgroundColor: player.stamina < 60 ? '#f43f5e' : '#10b981' }}></div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
      
      {onSwapPlayers && (
        <div className="text-center text-xs text-slate-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
          <p>Tap a <strong className="text-amber-400">starter</strong> and a <strong className="text-sky-400">substitute</strong> to perform a lineup change instantly.</p>
        </div>
      )}
    </div>
  );
};
