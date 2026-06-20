import React from 'react';
import { Club } from '../types';
import { Award } from 'lucide-react';

interface SeasonReviewModalProps {
  userClub: Club;
  balance: number;
  onResolve: (choice: 'stay' | 'change' | 'reset') => void;
}

export const SeasonReviewModal: React.FC<SeasonReviewModalProps> = ({ userClub, balance, onResolve }) => {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn text-left">
      <div className="bg-[#121620] border border-white/10 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#3b82f6] to-[#ea580c] rounded-2xl flex items-center justify-center border border-white/10 mx-auto">
            <Award className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">ANNUAL BOARD OF TRUSTEES EVALUATION</h2>
          <p className="text-[10px] text-slate-550 tracking-widest font-mono uppercase">Season complete managers review panel</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4 text-xs">
          <h3 className="text-[#38bdf8] font-bold block uppercase text-[10px] tracking-wider border-b border-white/5 pb-1 font-mono">
            Historical Record & Operations Statistics
          </h3>
          
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Played matchweeks:</span>
              <strong className="text-white font-mono">{userClub.played} Weeks Complete</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Final Table Points standing:</span>
              <strong className="text-emerald-400 font-mono">{userClub.points} Points Gained</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Club operations Cash:</span>
              <strong className="text-amber-500 font-mono">${balance.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Selection strategy choices */}
        <div className="space-y-3.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono font-bold">Pick Your Career Prolongation Path:</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => onResolve('stay')}
              className="bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500 p-3.5 rounded-xl text-center transition-all cursor-pointer group"
            >
              <span className="text-white group-hover:text-sky-400 text-xs font-black block uppercase tracking-tight">STAY IN CLUB</span>
              <span className="text-[8px] text-slate-400 block mt-1">Keep upgraded facilities, roster and operations cash balance.</span>
            </button>

            <button
              onClick={() => onResolve('change')}
              className="bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500 p-3.5 rounded-xl text-center transition-all cursor-pointer group"
            >
              <span className="text-white group-hover:text-amber-400 text-xs font-black block uppercase tracking-tight">CHANGE CLUBS</span>
              <span className="text-[8px] text-slate-400 block mt-1">Transfer career points, start fresh season at random elite club.</span>
            </button>

            <button
              onClick={() => onResolve('reset')}
              className="bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500 p-3.5 rounded-xl text-center transition-all cursor-pointer group"
            >
              <span className="text-white group-hover:text-rose-450 text-xs font-black block uppercase tracking-tight">HARD RESET SLOT</span>
              <span className="text-[8px] text-slate-400 block mt-1">Wipes all current stats, complete slot restart on defaults.</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
