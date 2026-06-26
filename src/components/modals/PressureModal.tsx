import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  consecutiveLosses: number;
  onClose: () => void;
}

export function PressureModal({ consecutiveLosses, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121620] border border-rose-500/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-center text-lg font-black text-white uppercase tracking-tight">Board Warning</h2>
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          The board is concerned about your recent form. {consecutiveLosses} consecutive defeats is unacceptable. Results must improve immediately or consequences will follow.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
        >
          Understood — I'll Turn This Around
        </button>
      </div>
    </div>
  );
}
