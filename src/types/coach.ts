import type { TeamMentalityType } from './shared';

export type CoachSpeciality =
  | 'Head Coach (Tactics)'
  | 'Assistant Manager'
  | 'Attacking Coach'
  | 'Defending Coach'
  | 'Goalkeeping Coach'
  | 'Set Pieces Coach'
  | 'Fitness & Conditioning Coach'
  | 'Youth Development Coach'
  | 'Pressing & Transition Coach'
  | 'Psychological Coach'
  | 'Medical Officer'
  | 'Chief Scout'
  | 'Data Analyst'
  // Legacy values kept for compatibility
  | 'Defending' | 'Attacking' | 'Youth' | 'Tactics' | 'Fitness' | 'Goalkeeping' | 'Set Pieces' | 'Corners' | 'Development';

export interface Coach {
  id: string;
  name: string;
  age: number;
  nationality?: string;
  specialty: CoachSpeciality | string;
  rating: number;
  preferredMentality?: TeamMentalityType;
  preferredPlaystyle?: string;
  personality?: string;
  wage?: number;
  contractLength?: number;
  bio?: string;
  cost: number;
}

export interface ManagerSkills {
  xp: number;
  level: number;
  skillPoints: number;
  tacticalMastermind: number;
  negotiator: number;
  youthDevelopment: number;
}
