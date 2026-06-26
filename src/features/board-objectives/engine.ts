import type { Club } from '../../types';
import type { BoardObjective, BoardState, ObjectiveDifficulty } from './types';
import { CUP_ROUND_RANK } from './types';

const uid = () => `obj-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

// ── Generate season objectives based on club reputation ───────────────────────
export function generateSeasonObjectives(
  userClub: Club,
  totalClubs: number,
  season: number,
): BoardObjective[] {
  const rep = userClub.reputation ?? 50;
  const objectives: BoardObjective[] = [];

  // 1. League position target
  const leagueTarget = rep >= 75 ? 3 : rep >= 55 ? Math.ceil(totalClubs / 3) : Math.ceil(totalClubs / 2);
  const leagueDiff: ObjectiveDifficulty = leagueTarget <= 3 ? 'hard' : leagueTarget <= 6 ? 'medium' : 'easy';
  objectives.push({
    id: uid(),
    type: 'league_position',
    description: `Finish in the top ${leagueTarget} in the league`,
    target: leagueTarget,
    current: totalClubs,  // starts at bottom; updated each week
    reward: leagueTarget <= 3 ? 500_000 : leagueTarget <= 6 ? 200_000 : 75_000,
    status: 'active',
    difficulty: leagueDiff,
    evaluationWeek: 26,
  });

  // 2. Cup objective (reach QF if good rep, R16 if average)
  const cupStageTarget = rep >= 70 ? 'QF' : 'R16';
  objectives.push({
    id: uid(),
    type: 'cup_round',
    description: `Reach the ${cupStageTarget === 'QF' ? 'Quarter-Finals' : 'Round of 16'} in the Cup`,
    target: CUP_ROUND_RANK[cupStageTarget],
    current: 0,
    reward: cupStageTarget === 'QF' ? 300_000 : 100_000,
    status: 'active',
    difficulty: cupStageTarget === 'QF' ? 'hard' : 'medium',
    evaluationWeek: 26,
  });

  // 3. Goals scored target (grows each season)
  const goalTarget = 30 + season * 5;
  objectives.push({
    id: uid(),
    type: 'goals_scored',
    description: `Score ${goalTarget} league goals across the season`,
    target: goalTarget,
    current: 0,
    reward: 150_000,
    status: 'active',
    difficulty: goalTarget >= 55 ? 'hard' : goalTarget >= 40 ? 'medium' : 'easy',
    evaluationWeek: 26,
  });

  return objectives;
}

// ── Update objectives based on current game state ─────────────────────────────
export function refreshObjectiveProgress(
  objectives: BoardObjective[],
  userClub: Club,
  allClubs: Club[],
  currentCupRound: string,
  currentWeek: number,
): BoardObjective[] {
  const sortedByPoints = [...allClubs]
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  const leaguePos = sortedByPoints.findIndex(c => c.id === userClub.id) + 1;
  const totalGoals = userClub.goalsFor;
  const cupRank = CUP_ROUND_RANK[currentCupRound] ?? 0;

  return objectives.map(obj => {
    if (obj.status !== 'active') return obj;

    let current = obj.current;
    switch (obj.type) {
      case 'league_position':  current = leaguePos; break;
      case 'cup_round':        current = Math.max(current, cupRank); break;
      case 'goals_scored':     current = totalGoals; break;
    }

    // Check if achieved (except at evaluationWeek — those evaluate on finish)
    let status: import('./types').ObjectiveStatus = obj.status;
    if (obj.type === 'goals_scored' && current >= obj.target) status = 'achieved';
    if (obj.type === 'cup_round' && current >= obj.target) status = 'achieved';
    if (obj.type === 'league_position' && currentWeek >= obj.evaluationWeek) {
      status = current <= obj.target ? 'achieved' : 'failed';
    }

    return { ...obj, current, status };
  });
}

// ── Calculate confidence change after objective evaluation ────────────────────
export function evalObjectivesForConfidence(
  objectives: BoardObjective[],
  currentConfidence: number,
): { newConfidence: number; delta: number; events: string[] } {
  const events: string[] = [];
  let delta = 0;

  for (const obj of objectives) {
    if (obj.status === 'achieved') {
      const gain = obj.difficulty === 'hard' ? 20 : obj.difficulty === 'medium' ? 12 : 7;
      delta += gain;
      events.push(`✅ Objective achieved: "${obj.description}" (+${gain} confidence)`);
    } else if (obj.status === 'failed') {
      const loss = obj.difficulty === 'hard' ? -18 : obj.difficulty === 'medium' ? -10 : -5;
      delta += loss;
      events.push(`❌ Objective missed: "${obj.description}" (${loss} confidence)`);
    }
  }

  return {
    newConfidence: Math.max(0, Math.min(100, currentConfidence + delta)),
    delta,
    events,
  };
}

// ── Adjust confidence for mid-season events ───────────────────────────────────
export function adjustConfidence(
  current: number,
  event: 'big_win' | 'loss_streak' | 'cup_exit' | 'derby_win' | 'relegation_zone',
): number {
  const deltas: Record<string, number> = {
    big_win: 5,
    loss_streak: -8,
    cup_exit: -5,
    derby_win: 8,
    relegation_zone: -12,
  };
  return Math.max(0, Math.min(100, current + (deltas[event] ?? 0)));
}
