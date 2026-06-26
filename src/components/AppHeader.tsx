import React from 'react';
import { Wallet, Bell } from 'lucide-react';
import type { Club, NotificationItem } from '../types';
import { DUAL_SCHEDULE } from '../data/schedule';

interface Props {
  managerName: string;
  currentWeek: number;
  userBalance: number;
  userClub: Club;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
}

export function AppHeader({ managerName, currentWeek, userBalance, userClub, notifications, onOpenNotifications }: Props) {
  const unread = notifications.filter(n => !n.read).length;
  const weekLabel = DUAL_SCHEDULE[currentWeek - 1]?.label || `Matchday ${currentWeek}`;

  return (
    <header className="h-14 md:h-20 flex items-center justify-between px-3 md:px-6 bg-[#0c0f16] border-b border-white/5 shrink-0 gap-2">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-sm md:text-xl font-black tracking-tight text-white uppercase flex items-center gap-1">
            SportSim{' '}
            <span className="text-sky-400 font-extrabold italic bg-sky-500/5 px-2 py-0.5 rounded border border-sky-400/10">Pro</span>
          </h1>
          <div className="hidden sm:flex text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-0.5 items-center gap-1">
            <span>First Team Operations Manager Console</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded uppercase">
              Dual Season Active
            </span>
          </div>
        </div>

        <div className="hidden md:flex bg-slate-900 border border-white/5 p-2 rounded-xl items-center gap-2 ml-4 text-xs">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Wk {currentWeek}/26</span>
          <span className="text-slate-700">|</span>
          <span className="text-[10px] text-[#facc15] font-bold uppercase truncate max-w-[140px]">{weekLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile compact balance */}
        <div className="flex sm:hidden items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
          <span className="text-emerald-400 font-mono font-black text-xs">${userBalance.toLocaleString()}</span>
        </div>
        {/* Desktop balance */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[9px] uppercase text-slate-500 font-bold tracking-widest mb-0.5 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-emerald-400" /> Budget
          </span>
          <span className="text-emerald-400 font-mono font-black text-xl leading-none">${userBalance.toLocaleString()}</span>
        </div>

        {/* Notification bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4 text-slate-400" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-black font-black text-[8px] flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        {/* Club crest + manager name */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-inner border border-white/15"
            style={{ backgroundColor: `${userClub.color}25`, color: userClub.color }}
          >
            {userClub.name.substring(0, 2)}
          </div>
          <div className="text-left hidden md:block">
            <span className="text-white text-xs font-black block">{managerName}</span>
            <span className="text-[9px] text-[#94a3b8] block uppercase font-mono tracking-wider">{userClub.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
