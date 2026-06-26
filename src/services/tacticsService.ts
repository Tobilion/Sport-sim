import type { Club, Player, PlaystyleType, TeamMentalityType, TeamFormationType } from '../types';

export function applyLineupChange(clubs: Club[], userClubId: string, newSquad: Player[]): Club[] {
  return clubs.map(c => c.id === userClubId ? { ...c, squad: newSquad } : c);
}

export function applyPlaystyleChange(clubs: Club[], userClubId: string, playstyle: PlaystyleType): Club[] {
  return clubs.map(c => c.id === userClubId ? { ...c, playstyle } : c);
}

export function applyMentalityChange(clubs: Club[], userClubId: string, mentality: TeamMentalityType): Club[] {
  return clubs.map(c => c.id === userClubId ? { ...c, mentality } : c);
}

export function applyFormationChange(clubs: Club[], userClubId: string, formation: TeamFormationType): Club[] {
  return clubs.map(c => c.id === userClubId ? { ...c, formation } : c);
}
