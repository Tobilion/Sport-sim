import React, { useMemo } from 'react';
import { Club } from '../types';

interface PitchCanvasProps {
  ballX: number;
  ballY: number;
  possession: 'home' | 'away';
  homeClub: Club;
  awayClub: Club;
  zone: 'DEF' | 'MID' | 'ATT';
}

export default function PitchCanvas({
  ballX,
  ballY,
  possession,
  homeClub,
  awayClub,
  zone
}: PitchCanvasProps) {
  // Let's lay out standard player tactical coordinate dots depending on active mentalities
  // We can calculate dynamic offsets back and forth to simulate tactical coverage!
  const homePlayerNodes = useMemo(() => {
    const isAttacking = possession === 'home';
    const mentality = homeClub.mentality;
    const offsetMultiplier = isAttacking ? 1.1 : 0.85;

    // Default coordinates in percent
    let coordinates = [
      { id: '1', role: 'GK', x: 8, y: 50 },
      { id: '2', role: 'DEF', x: 22, y: 25 },
      { id: '3', role: 'DEF', x: 20, y: 50 },
      { id: '4', role: 'DEF', x: 22, y: 75 },
      { id: '5', role: 'MID', x: 42, y: 30 },
      { id: '6', role: 'MID', x: 40, y: 70 },
      { id: '7', role: 'ATT', x: 62, y: 50 },
      { id: '8', role: 'ATT', x: 58, y: 20 },
      { id: '9', role: 'ATT', x: 58, y: 80 }
    ];

    // Modify offsets based on team mentality
    if (mentality === 'Park the Bus') {
      coordinates = coordinates.map(c => 
        c.role !== 'GK' ? { ...c, x: c.x * 0.7 } : c
      );
    } else if (mentality === 'Gegenpressing') {
      coordinates = coordinates.map(c => 
        c.role !== 'GK' ? { ...c, x: Math.min(90, c.x * 1.25) } : c
      );
    } else if (mentality === 'Tiki-Taka') {
      // Gather tighter structure
      coordinates = coordinates.map(c => ({
        ...c,
        y: c.y > 50 ? c.y - 8 : c.y < 50 ? c.y + 8 : c.y,
        x: c.role !== 'GK' ? c.x * 1.05 : c.x
      }));
    }

    return coordinates.map(c => ({
      ...c,
      x: Math.min(94, Math.max(4, c.x * offsetMultiplier))
    }));
  }, [possession, homeClub.mentality]);

  const awayPlayerNodes = useMemo(() => {
    const isAttacking = possession === 'away';
    const mentality = awayClub.mentality;
    const offsetMultiplier = isAttacking ? 0.9 : 1.15;

    // Default coordinates (oriented from home's perspective where away goal is at 100)
    let coordinates = [
      { id: '1', role: 'GK', x: 92, y: 50 },
      { id: '2', role: 'DEF', x: 78, y: 25 },
      { id: '3', role: 'DEF', x: 80, y: 50 },
      { id: '4', role: 'DEF', x: 78, y: 75 },
      { id: '5', role: 'MID', x: 58, y: 30 },
      { id: '6', role: 'MID', x: 60, y: 70 },
      { id: '7', role: 'ATT', x: 38, y: 50 },
      { id: '8', role: 'ATT', x: 42, y: 20 },
      { id: '9', role: 'ATT', x: 42, y: 80 }
    ];

    // Modify offsets based on team mentality
    if (mentality === 'Park the Bus') {
      coordinates = coordinates.map(c => 
        c.role !== 'GK' ? { ...c, x: 100 - (100 - c.x) * 0.7 } : c
      );
    } else if (mentality === 'Gegenpressing') {
      coordinates = coordinates.map(c => 
        c.role !== 'GK' ? { ...c, x: Math.max(10, 100 - (100 - c.x) * 1.25) } : c
      );
    } else if (mentality === 'Tiki-Taka') {
      coordinates = coordinates.map(c => ({
        ...c,
        y: c.y > 50 ? c.y - 8 : c.y < 50 ? c.y + 8 : c.y,
        x: c.role !== 'GK' ? 100 - (100 - c.x) * 1.05 : c.x
      }));
    }

    return coordinates.map(c => ({
      ...c,
      x: Math.min(96, Math.max(6, c.x * offsetMultiplier))
    }));
  }, [possession, awayClub.mentality]);

  return (
    <div id="pitch-container" className="flex-1 min-h-[280px] md:min-h-[340px] bg-gradient-to-b from-[#0b1b11] to-[#040e08] rounded-xl border border-white/10 relative overflow-hidden flex flex-col p-4 shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Stadium grass textures & lighting glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_#10b981_0%,_transparent_85%)]"></div>
      
      {/* Pitch Grass Stripes */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-5">
        {Array.from({ length: 15 }).map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 w-full ${idx % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}
          />
        ))}
      </div>

      {/* Touchline Boundaries & Boxes */}
      <div className="absolute inset-x-3 inset-y-3 border border-white/10 pointer-events-none rounded-sm">
        {/* Midline */}
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/10"></div>
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 border border-white/10 rounded-full"></div>
        {/* Center spot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full"></div>

        {/* Home Penalty Box */}
        <div className="absolute inset-y-[20%] left-0 w-[14%] border-r border-y border-white/10 bg-[#10b981]/1">
          {/* Goal post outline */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-[6px] w-[5px] h-[40%] bg-white/20 border-l border-y border-white/10"></div>
        </div>
        {/* Away Penalty Box */}
        <div className="absolute inset-y-[20%] right-0 w-[14%] border-l border-y border-white/10 bg-[#10b981]/1">
          {/* Goal post outline */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-[6px] w-[5px] h-[40%] bg-white/20 border-r border-y border-white/10"></div>
        </div>
      </div>

      {/* Home Player Dot Nodes */}
      {homePlayerNodes.map(p => (
        <div
          key={`home-dot-${p.id}`}
          className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white font-mono text-[6px] font-black pointer-events-none text-black select-none z-10 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: homeClub.color
          }}
          title={`${p.role}`}
        >
          <span style={{ color: homeClub.secondaryColor }}>{p.role[0]}</span>
        </div>
      ))}

      {/* Away Player Dot Nodes */}
      {awayPlayerNodes.map(p => (
        <div
          key={`away-dot-${p.id}`}
          className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white font-mono text-[6px] font-black pointer-events-none text-black select-none z-10 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: awayClub.color
          }}
          title={`${p.role}`}
        >
          <span style={{ color: awayClub.secondaryColor }}>{p.role[0]}</span>
        </div>
      ))}

      {/* Ball (fluctuating, sliding with possession glow indicator) */}
      <div
        id="pitch-ball"
        className={`absolute w-2.5 h-2.5 bg-yellow-100 rounded-full z-20 transition-all duration-700 ease-in-out border border-slate-950 ${
          possession === 'home'
            ? `shadow-[0_0_12px_6px_${homeClub.color}]`
            : `shadow-[0_0_12px_6px_${awayClub.color}]`
        }`}
        style={{
          left: `${ballX}%`,
          top: `${ballY}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-full h-full animate-ping bg-white/20 rounded-full scale-110"></div>
      </div>

      {/* Momentum / Zone Visual Indicator Overlay */}
      <div className="mt-auto flex justify-between items-end z-10 pointer-events-none relative pt-16">
        <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5 flex flex-col">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Play Zone</span>
          <span className="text-xs font-mono font-bold uppercase" style={{ color: possession === 'home' ? homeClub.color : awayClub.color }}>
            {zone === 'DEF' ? '🛡️ Defensive Grid' : zone === 'MID' ? '⚔️ Midfield Duels' : '🎯 Danger Box'}
          </span>
        </div>
        
        <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5 flex flex-col text-right">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Active Possession</span>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">
            {possession === 'home' ? homeClub.name : awayClub.name}
          </span>
        </div>
      </div>
    </div>
  );
}
