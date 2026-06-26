// ── Objective types ────────────────────────────────────────────────────────────
export type ObjectiveType =
  | 'league_position'   // finish in top N
  | 'cup_round'         // reach at least this cup stage
  | 'win_streak'        // win X consecutive
  | 'goals_scored'      // squad scores X goals total
  | 'unbeaten_run'      // X games without losing
  | 'financial_target'; // balance ≥ X at season end

export type ObjectiveDifficulty = 'easy' | 'medium' | 'hard';
export type ObjectiveStatus = 'active' | 'achieved' | 'failed';

export interface BoardObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: number;
  current: number;
  reward: number;          // £ bonus if achieved
  status: ObjectiveStatus;
  difficulty: ObjectiveDifficulty;
  evaluationWeek: number;  // week the objective is assessed (usually 26)
}

// ── Board confidence ───────────────────────────────────────────────────────────
// 0-100 scale; starts at 50; triggers at 20 (warning) and 5 (sacked)
export interface BoardState {
  confidence: number;        // 0-100
  objectives: BoardObjective[];
  season: number;
}

export const INITIAL_BOARD_STATE: BoardState = {
  confidence: 50,
  objectives: [],
  season: 1,
};

export const CONFIDENCE_THRESHOLDS = {
  WARNING: 20,
  SACKED: 5,
  COMFORTABLE: 60,
  EXCELLENT: 85,
} as const;

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 85) return 'Outstanding';
  if (confidence >= 60) return 'Comfortable';
  if (confidence >= 40) return 'Satisfied';
  if (confidence >= 20) return 'Concerned';
  if (confidence >= 5)  return 'On Thin Ice';
  return 'Sacked';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 60) return '#22c55e'; // green
  if (confidence >= 40) return '#eab308'; // yellow
  if (confidence >= 20) return '#f97316'; // orange
  return '#ef4444';                       // red
}

// Cup round name → numeric rank for comparison
export const CUP_ROUND_RANK: Record<string, number> = {
  'R32': 1, 'R16': 2, 'QF': 3, 'SF': 4, 'F': 5, 'Winner': 6,
};
