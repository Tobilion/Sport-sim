import React from 'react';
import {
  Trophy, Calendar, Award, BarChart3, Globe, Briefcase,
  Zap, DollarSign, Target, Newspaper, Users,
} from 'lucide-react';
import type { LiveMatchSimulation } from '../types';

type TabId = 'MANAGER' | 'NEXT_MATCH' | 'FIXTURES' | 'STANDINGS' | 'ANALYTICS' | 'NEWS' | 'ALL_TEAMS' | 'TROPHIES' | 'BOARD' | 'FINANCES';

interface Props {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogOut: () => void;
  activeSimulation: LiveMatchSimulation | null;
}

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'MANAGER',    label: 'Squad',    icon: Briefcase  },
  { id: 'NEXT_MATCH', label: 'Next',     icon: Zap        },
  { id: 'FIXTURES',   label: 'Fixtures', icon: Calendar   },
  { id: 'STANDINGS',  label: 'Table',    icon: Award      },
  { id: 'ANALYTICS',  label: 'Stats',    icon: BarChart3  },
  { id: 'NEWS',       label: 'News',     icon: Newspaper  },
  { id: 'ALL_TEAMS',  label: 'Teams',    icon: Users      },
  { id: 'TROPHIES',   label: 'Trophies', icon: Trophy     },
  { id: 'BOARD',      label: 'Board',    icon: Target     },
  { id: 'FINANCES',   label: 'Finance',  icon: DollarSign },
];

export function AppNav({ currentTab, onTabChange, onLogOut, activeSimulation }: Props) {
  return (
    <nav className="w-14 md:w-[60px] bg-[#0c0f16] border-r border-white/5 flex flex-col items-center py-3 px-1 shrink-0 overflow-y-auto gap-2">
      {/* Logo / back to saves */}
      <button
        onClick={onLogOut}
        className="w-9 h-9 bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)] cursor-pointer mb-1 shrink-0"
        title="Career Selection"
      >
        <Trophy className="text-black w-4 h-4 shrink-0" />
      </button>

      {/* Nav items */}
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isSelected = currentTab === item.id;
        const hasLive = item.id === 'NEXT_MATCH' && activeSimulation;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            title={item.label}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer w-full shrink-0 ${
              isSelected
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-[17px] h-[17px] shrink-0" />
            <span className="text-[7.5px] mt-0.5 font-bold uppercase tracking-wide leading-none text-center w-full truncate px-0.5">
              {item.label}
            </span>
            {hasLive && (
              <span className="absolute top-0.5 right-0.5 w-[18px] bg-red-500 text-black font-black text-[6px] py-[1px] rounded-full animate-pulse uppercase text-center leading-none">
                LIVE
              </span>
            )}
          </button>
        );
      })}

      {/* Spacer + saves */}
      <div className="mt-auto pt-2 w-full">
        <button
          onClick={onLogOut}
          className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all text-[7px] uppercase font-bold text-center tracking-wide"
          title="Save Slots"
        >
          SAVES
        </button>
      </div>
    </nav>
  );
}
