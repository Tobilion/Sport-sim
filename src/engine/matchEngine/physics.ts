import type { Club, LiveMatchSimulation, Player } from '../../types';
import { randRange } from '../../data/names';

export interface CoachBonuses {
  defBonus: number;
  passBonus: number;
  gkBonus: number;
  setPieceBonus: number;
}

export function calcCoachBonuses(club: Club): CoachBonuses {
  const coaches = club.coaches ?? [];
  return {
    defBonus:
      (club.trainingFacilities - 1) * 0.5 +
      coaches.filter((c) => c.specialty === 'Defending').reduce((acc, c) => acc + c.rating / 50, 0),
    passBonus:
      (club.tacticsFacilities - 1) * 0.5 +
      coaches
        .filter((c) => c.specialty === 'Tactics' || c.specialty === 'Attacking')
        .reduce((acc, c) => acc + c.rating / 50, 0),
    gkBonus: coaches
      .filter((c) => c.specialty === 'Goalkeeping')
      .reduce((acc, c) => acc + c.rating / 40, 0),
    setPieceBonus: coaches
      .filter((c) => c.specialty === 'Set Pieces' || c.specialty === 'Corners')
      .reduce((acc, c) => acc + c.rating / 40, 0),
  };
}

export function getStartingByPos(club: Club, pos: Player['position']): Player[] {
  return club.squad.filter((p) => p.position === pos && p.isStarting && p.stamina > 5);
}

export function getGK(club: Club): Player {
  return (
    club.squad.find((p) => p.position === 'GK' && p.isStarting) ||
    club.squad.find((p) => p.position === 'GK') ||
    club.squad[0]
  );
}

// Returns which team wins possession this tick.
export function resolvePossession(
  sim: LiveMatchSimulation,
  homeClub: Club,
  awayClub: Club,
  homePassBonus: number,
  awayPassBonus: number,
): 'home' | 'away' {
  const homeStarters = homeClub.squad.filter((p) => p.isStarting);
  const awayStarters = awayClub.squad.filter((p) => p.isStarting);
  const homeAvg = homeStarters.reduce((a, p) => a + p.rating, 0) / (homeStarters.length || 1);
  const awayAvg = awayStarters.reduce((a, p) => a + p.rating, 0) / (awayStarters.length || 1);

  let weight = 50 + (homeAvg - awayAvg) + (homePassBonus - awayPassBonus);

  const hPlaystyle = sim.userPlaystyle ?? homeClub.playstyle;
  const aPlaystyle = sim.userPlaystyle ?? awayClub.playstyle;
  if (hPlaystyle === 'Attacking') weight += 4;
  if (hPlaystyle === 'Defending') weight -= 4;
  if (aPlaystyle === 'Attacking') weight -= 4;
  if (aPlaystyle === 'Defending') weight += 4;

  if (homeClub.mentality === 'Tiki-Taka') weight += 6;
  if (awayClub.mentality === 'Tiki-Taka') weight -= 6;
  if (homeClub.mentality === 'Park the Bus') weight -= 11;
  if (awayClub.mentality === 'Park the Bus') weight += 11;

  weight = Math.min(80, Math.max(20, weight));
  return randRange(1, 100) <= weight ? 'home' : 'away';
}

// Decays stamina for all starting players each tick.
export function applyStaminaDecay(club: Club): void {
  club.squad.forEach((p) => {
    if (p.isStarting) {
      let decay = 0.55 + (100 - p.rating) * 0.005;
      if (club.mentality === 'Gegenpressing') decay += 0.35;
      if (club.cardioFacilities > 1) decay -= (club.cardioFacilities - 1) * 0.085;
      p.stamina = Math.max(10, Number((p.stamina - decay).toFixed(1)));
    } else {
      p.stamina = Math.min(100, Number((p.stamina + 0.1).toFixed(1)));
    }
  });
}
