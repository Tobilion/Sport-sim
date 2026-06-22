import React from 'react';
import { X, Bell, Trophy, Heart, AlertCircle, Zap, Briefcase, Info, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

const getIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'transfer': return <Briefcase className="w-3.5 h-3.5" />;
    case 'morale': return <Heart className="w-3.5 h-3.5" />;
    case 'injury': return <AlertCircle className="w-3.5 h-3.5" />;
    case 'scout': return <Zap className="w-3.5 h-3.5" />;
    case 'match': return <Trophy className="w-3.5 h-3.5" />;
    case 'board': return <Bell className="w-3.5 h-3.5" />;
    default: return <Info className="w-3.5 h-3.5" />;
  }
};

const getTypeColor = (type: NotificationItem['type']): string => {
  switch (type) {
    case 'transfer': return 'text-sky-400 bg-sky-500/15 border-sky-500/25';
    case 'morale': return 'text-pink-400 bg-pink-500/15 border-pink-500/25';
    case 'injury': return 'text-rose-400 bg-rose-500/15 border-rose-500/25';
    case 'scout': return 'text-amber-400 bg-amber-500/15 border-amber-500/25';
    case 'match': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
    case 'board': return 'text-purple-400 bg-purple-500/15 border-purple-500/25';
    default: return 'text-slate-400 bg-slate-500/15 border-slate-500/25';
  }
};

const timeAgo = (ts: number): string => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[380px] bg-[#0d1117] border-l border-white/10 flex flex-col shadow-2xl animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-black text-[9px] flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-all cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-400">All caught up 👍</p>
              <p className="text-xs text-slate-600 mt-1">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-all relative ${!n.read ? 'border-l-2 border-sky-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${getTypeColor(n.type)}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[9px] text-slate-600 mt-1 font-mono">{timeAgo(n.timestamp)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
