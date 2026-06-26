export type PersonalityTrait =
  | 'Leader'
  | 'Ambitious'
  | 'Loyal'
  | 'Professional'
  | 'Temperamental'
  | 'Mercenary'
  | 'Team Player'
  | 'Star';

export interface PlayerAmbition {
  type: 'win_league' | 'score_goals' | 'appearances' | 'win_cup';
  target: number;
  current: number;
  fulfilled: boolean;
}

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  age: number;
  rating: number;
  potentialRating?: number;
  isYouth?: boolean;
  isFocused?: boolean;
  focusedCoachId?: string | null;
  stamina: number;
  morale: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchRatings: number[];
  marketValue: number;
  attributes: PlayerAttributes;
  isStarting: boolean;
  trainingProgress?: number;
  saves: number;
  fatigue?: number;
  disciplinaryRecord?: { yellowCards: number; redCards: number; suspensionGamesRemaining: number };
  tournamentGoals?: number;
  tournamentAssists?: number;
  tournamentYellowCards?: number;
  tournamentRedCards?: number;
  tournamentSaves?: number;
  appearances?: number;
  developmentLog?: { week: number; changes: Record<string, number> }[];
  personality?: PersonalityTrait;
  formStreak?: number;
  injuryWeeksRemaining?: number;
  injuryType?: string;
  nationality?: string;
  biography?: string;
  ambition?: PlayerAmbition;
  shirtNumber?: number;
}
