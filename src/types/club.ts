import type { Player } from './player';
import type { Coach } from './coach';
import type { TeamMentalityType, PlaystyleType, TeamFormationType } from './shared';
export type { TeamMentalityType, PlaystyleType, TeamFormationType } from './shared';

export interface Club {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  squad: Player[];
  youthSquad?: Player[];
  mentality: TeamMentalityType;
  playstyle?: PlaystyleType;
  formation?: TeamFormationType;
  trainingFacilities: number;
  tacticsFacilities: number;
  cardioFacilities: number;
  medicalFacilities: number;
  accommodationFacilities?: number;
  coach: Coach;
  coaches?: Coach[];
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  streak: ('W' | 'D' | 'L')[];
  reputation?: number;
  wageBudget?: number;
  wageSpend?: number;
  headToHead?: Record<string, { w: number; d: number; l: number }>;
  kitPrimaryColor?: string;
  kitSecondaryColor?: string;
  prizeMoneyEarned?: number;
}
