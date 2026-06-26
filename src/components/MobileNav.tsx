import React from 'react';

type TabId = 'MANAGER' | 'NEXT_MATCH' | 'FIXTURES' | 'STANDINGS' | 'ANALYTICS' | 'NEWS' | 'ALL_TEAMS' | 'TROPHIES';

interface Props {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const MOBILE_TABS = [
  { id: 'NEXT_MATCH' as TabId, icon: '▶', label: 'Next' },
  { id: 'FIXTURES'   as TabId, icon: '🏆', label: 'Fixtures' },
  { id: 'MANAGER'    as TabId, icon: '👥', label: 'Squad' },
  { id: 'STANDINGS'  as TabId, icon: '📋', label: 'Standings' },
  { id: 'ANALYTICS'  as TabId, icon: '📊', label: 'Stats' },
];

export function MobileNav({ currentTab, onTabChange }: Props) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c12]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-1 pb-safe">
      {MOBILE_TABS.map(item => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center justify-center py-2.5 px-2 min-w-[52px] transition-all ${
            currentTab === item.id ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
