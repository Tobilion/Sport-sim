import React, { useState } from 'react';
import { Shirt, Check } from 'lucide-react';

interface KitCustomizerProps {
  primaryColor: string;
  secondaryColor: string;
  onSave: (primary: string, secondary: string) => void;
}

const PRESET_COLORS = [
  '#00D4FF', '#F59E0B', '#EF4444', '#22C55E',
  '#A855F7', '#F97316', '#EC4899', '#FFFFFF',
  '#1E40AF', '#0F172A', '#064E3B', '#7C2D12',
];

type Pattern = 'solid' | 'stripes' | 'halves' | 'diagonal';
const PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'halves', label: 'Halves' },
  { id: 'diagonal', label: 'Diagonal' },
];

const KitPreview: React.FC<{ primary: string; secondary: string; pattern: Pattern }> = ({ primary, secondary, pattern }) => {
  const gradientMap: Record<Pattern, string> = {
    solid: primary,
    stripes: `repeating-linear-gradient(90deg, ${primary} 0px, ${primary} 12px, ${secondary} 12px, ${secondary} 24px)`,
    halves: `linear-gradient(180deg, ${primary} 0%, ${primary} 50%, ${secondary} 50%, ${secondary} 100%)`,
    diagonal: `linear-gradient(135deg, ${primary} 0%, ${primary} 50%, ${secondary} 50%, ${secondary} 100%)`,
  };

  return (
    <svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[120px]">
      <defs>
        <clipPath id="shirt-clip">
          <path d="M20 20 L45 5 L60 15 L75 5 L100 20 L110 50 L88 55 L88 125 L32 125 L32 55 L10 50 Z" />
        </clipPath>
        {pattern !== 'solid' && (
          <pattern id="kit-pattern" x="0" y="0" width={pattern === 'stripes' ? '24' : '120'} height={pattern === 'stripes' ? '130' : '130'} patternUnits="userSpaceOnUse">
            {pattern === 'stripes' && (
              <>
                <rect x="0" y="0" width="12" height="130" fill={primary} />
                <rect x="12" y="0" width="12" height="130" fill={secondary} />
              </>
            )}
            {pattern === 'halves' && (
              <>
                <rect x="0" y="0" width="120" height="65" fill={primary} />
                <rect x="0" y="65" width="120" height="65" fill={secondary} />
              </>
            )}
            {pattern === 'diagonal' && (
              <>
                <polygon points="0,0 120,0 120,130 0,0" fill={primary} />
                <polygon points="0,0 120,0 0,130" fill={secondary} />
              </>
            )}
          </pattern>
        )}
      </defs>
      {/* Shirt body */}
      <path
        d="M20 20 L45 5 L60 15 L75 5 L100 20 L110 50 L88 55 L88 125 L32 125 L32 55 L10 50 Z"
        fill={pattern === 'solid' ? primary : `url(#kit-pattern)`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
      />
      {/* Collar */}
      <path d="M50 8 Q60 20 70 8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      {/* Sleeve seams */}
      <line x1="32" y1="55" x2="10" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="88" y1="55" x2="110" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    </svg>
  );
};

export const KitCustomizer: React.FC<KitCustomizerProps> = ({ primaryColor, secondaryColor, onSave }) => {
  const [primary, setPrimary] = useState(primaryColor);
  const [secondary, setSecondary] = useState(secondaryColor);
  const [pattern, setPattern] = useState<Pattern>('solid');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(primary, secondary);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-6 items-center flex-wrap">
        {/* Kit preview */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <KitPreview primary={primary} secondary={secondary} pattern={pattern} />
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Preview</p>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4 min-w-[200px]">
          {/* Primary color */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Primary Color</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setPrimary(c)}
                  className={`w-6 h-6 rounded-md border-2 transition-all cursor-pointer hover:scale-110 ${primary === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={primary}
                onChange={e => setPrimary(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border border-white/20 bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Secondary color */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Secondary Color</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSecondary(c)}
                  className={`w-6 h-6 rounded-md border-2 transition-all cursor-pointer hover:scale-110 ${secondary === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={secondary}
                onChange={e => setSecondary(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border border-white/20 bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Pattern */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pattern</p>
            <div className="flex gap-2 flex-wrap">
              {PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPattern(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    pattern === p.id
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
          saved ? 'bg-emerald-500 text-black' : 'bg-sky-500 hover:bg-sky-400 text-black'
        }`}
      >
        {saved ? <Check className="w-3.5 h-3.5" /> : <Shirt className="w-3.5 h-3.5" />}
        {saved ? 'Kit Saved!' : 'Save Kit'}
      </button>
    </div>
  );
};
