import React from 'react';
import type { BoardState, BoardObjective } from './types';
import {
  getConfidenceLabel, getConfidenceColor,
  CONFIDENCE_THRESHOLDS,
} from './types';
import { CUP_ROUND_RANK } from './types';

interface Props {
  boardState: BoardState;
  currentWeek: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`;

function progressPercent(obj: BoardObjective): number {
  if (obj.type === 'league_position') {
    // Lower position = better; target 1 = best
    // Invert: if target is 4, current 6 → 4/6 * 100 progress toward a good direction
    const worst = 16; // assume 16 clubs
    const range = worst - obj.target;
    const achieved = worst - obj.current;
    return Math.max(0, Math.min(100, (achieved / range) * 100));
  }
  return Math.max(0, Math.min(100, (obj.current / obj.target) * 100));
}

function progressLabel(obj: BoardObjective): string {
  if (obj.type === 'league_position') return `League pos: ${obj.current} (target: top ${obj.target})`;
  if (obj.type === 'cup_round') {
    const reached = Object.entries(CUP_ROUND_RANK).find(([, v]) => v === obj.current)?.[0] ?? 'Not started';
    const target  = Object.entries(CUP_ROUND_RANK).find(([, v]) => v === obj.target)?.[0] ?? '?';
    return `Reached: ${reached} (target: ${target})`;
  }
  if (obj.type === 'goals_scored') return `${obj.current} / ${obj.target} goals`;
  if (obj.type === 'win_streak')   return `${obj.current} / ${obj.target} consecutive wins`;
  if (obj.type === 'financial_target') return `$${(obj.current / 1000).toFixed(0)}K / $${(obj.target / 1000).toFixed(0)}K`;
  return `${obj.current} / ${obj.target}`;
}

const difficultyBadge = (d: BoardObjective['difficulty']) => {
  const cfg = { easy: 'bg-green-500/20 text-green-300', medium: 'bg-yellow-500/20 text-yellow-300', hard: 'bg-red-500/20 text-red-300' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cfg[d]}`}>{d}</span>
  );
};

const statusIcon = (s: BoardObjective['status']) => {
  if (s === 'achieved') return '✅';
  if (s === 'failed')   return '❌';
  return '🎯';
};

// ── Confidence meter ──────────────────────────────────────────────────────────
function ConfidenceMeter({ confidence }: { confidence: number }) {
  const color = getConfidenceColor(confidence);
  const label = getConfidenceLabel(confidence);
  const isWarning = confidence <= CONFIDENCE_THRESHOLDS.WARNING;

  return (
    <div className={`rounded-xl border p-4 mb-4 ${
      isWarning ? 'border-red-700/50 bg-red-900/20' : 'border-gray-700/50 bg-gray-800/60'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-white font-semibold text-sm">Board Confidence</p>
          <p className="text-gray-400 text-xs">How the board views your performance</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg" style={{ color }}>{confidence}</p>
          <p className="text-xs font-medium" style={{ color }}>{label}</p>
        </div>
      </div>

      {/* Bar */}
      <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${confidence}%`, background: color }}
        />
      </div>

      {/* Threshold markers */}
      <div className="relative h-1 mt-1">
        <div className="absolute left-[5%] w-px h-2 bg-red-500 top-0" title="Sacked" />
        <div className="absolute left-[20%] w-px h-2 bg-orange-500 top-0" title="Warning" />
        <div className="absolute left-[60%] w-px h-2 bg-green-500 top-0" title="Comfortable" />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-0.5">
        <span>Sacked</span>
        <span>Warning</span>
        <span>Comfortable</span>
        <span>Excellent</span>
      </div>

      {isWarning && (
        <div className="mt-3 flex items-start gap-2 bg-red-800/30 rounded-lg p-2">
          <span className="text-red-400 text-base">⚠️</span>
          <p className="text-red-300 text-xs">
            {confidence <= CONFIDENCE_THRESHOLDS.SACKED
              ? 'The board has lost faith. You are on the brink of dismissal.'
              : 'The board is seriously concerned. Improve results or face the sack.'}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Objective card ────────────────────────────────────────────────────────────
function ObjectiveCard({ obj }: { obj: BoardObjective }) {
  const pct = progressPercent(obj);
  const isFailed   = obj.status === 'failed';
  const isAchieved = obj.status === 'achieved';

  const borderCls = isAchieved
    ? 'border-green-700/50 bg-green-900/10'
    : isFailed
    ? 'border-red-700/50 bg-red-900/10'
    : 'border-gray-700/50 bg-gray-800/60';

  const barColor = isAchieved ? '#22c55e' : isFailed ? '#ef4444' : '#3b82f6';

  return (
    <div className={`rounded-xl border p-4 ${borderCls}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base mt-0.5">{statusIcon(obj.status)}</span>
          <p className="text-white text-sm font-medium leading-snug">{obj.description}</p>
        </div>
        {difficultyBadge(obj.difficulty)}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <span className="text-gray-400 text-xs whitespace-nowrap">{Math.round(pct)}%</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{progressLabel(obj)}</span>
        <span className="text-emerald-400 font-medium">+{fmtK(obj.reward)} if achieved</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BoardObjectives({ boardState, currentWeek }: Props) {
  const { confidence, objectives } = boardState;
  const active   = objectives.filter(o => o.status === 'active');
  const achieved = objectives.filter(o => o.status === 'achieved');
  const failed   = objectives.filter(o => o.status === 'failed');

  return (
    <div className="flex flex-col gap-4">
      <ConfidenceMeter confidence={confidence} />

      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Season Objectives · Week {currentWeek} / 26
        </p>
        {objectives.length === 0 ? (
          <div className="bg-gray-800/40 rounded-xl border border-gray-700/40 p-6 text-center">
            <p className="text-gray-500 text-sm">No objectives set — objectives generate at season start</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {active.length > 0 && active.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
            {achieved.length > 0 && (
              <>
                <p className="text-green-400 text-xs font-semibold mt-2">Achieved</p>
                {achieved.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
              </>
            )}
            {failed.length > 0 && (
              <>
                <p className="text-red-400 text-xs font-semibold mt-2">Failed</p>
                {failed.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Season timeline */}
      <div className="bg-gray-800/40 rounded-xl border border-gray-700/40 p-4">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Season Progress</p>
        <div className="relative">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentWeek / 26) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Week 1</span>
            <span className="text-blue-400 font-medium">Week {currentWeek}</span>
            <span>Week 26</span>
          </div>
        </div>
      </div>
    </div>
  );
}
