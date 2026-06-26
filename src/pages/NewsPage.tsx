import React from 'react';
import { Globe } from 'lucide-react';
import type { NewsItem } from '../types';

interface Props {
  newsFeed: NewsItem[];
}

export function NewsPage({ newsFeed }: Props) {
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="bg-[#121620] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-sky-400" />
          Global Sports Media Feed
        </h2>
        {newsFeed.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No news generated yet. Play some matches!</p>
        ) : (
          <div className="space-y-3">
            {newsFeed.map(news => (
              <div key={news.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex gap-3 items-start relative overflow-hidden">
                <div className={`w-1 h-full absolute left-0 top-0 ${
                  news.type === 'match'    ? 'bg-sky-500'   :
                  news.type === 'transfer' ? 'bg-amber-500' :
                  news.type === 'injury'   ? 'bg-red-500'   : 'bg-emerald-500'
                }`} />
                <div className="flex-1 pl-2">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Week {news.week} • {news.type}
                  </div>
                  <div className="text-sm font-bold text-slate-200">{news.headline}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
