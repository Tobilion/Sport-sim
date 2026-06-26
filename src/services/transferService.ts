import type { Club, Player, Coach } from '../types';

export function applyPlayerPurchase(clubs: Club[], userClubId: string, newPlayer: Player): Club[] {
  return clubs.map(c =>
    c.id === userClubId ? { ...c, squad: [...c.squad, newPlayer] } : c
  );
}

export function applyPlayerSale(clubs: Club[], userClubId: string, playerId: string): Club[] {
  return clubs.map(c =>
    c.id === userClubId ? { ...c, squad: c.squad.filter(p => p.id !== playerId) } : c
  );
}

export function applyCoachPurchase(clubs: Club[], userClubId: string, newCoach: Coach): Club[] {
  return clubs.map(c =>
    c.id === userClubId ? { ...c, coaches: [...(c.coaches || []), newCoach] } : c
  );
}

export function applyCoachDismissal(clubs: Club[], userClubId: string, coachId: string): Club[] {
  return clubs.map(c =>
    c.id === userClubId ? { ...c, coaches: (c.coaches || []).filter(co => co.id !== coachId) } : c
  );
}

export interface TakeoverResult {
  updatedClubs: Club[];
  cost: number;
}

export function applyClubTakeover(clubs: Club[], newClubId: string): TakeoverResult {
  const target = clubs.find(c => c.id === newClubId);
  const cost = target ? Math.round((target.reputation ?? 50) * 50000) : 0;
  return { updatedClubs: clubs, cost };
}
