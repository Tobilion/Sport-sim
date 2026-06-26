import type { Club, Player } from '../types';

export function applyYouthSale(clubs: Club[], userClubId: string, playerId: string): Club[] {
  return clubs.map(c =>
    c.id !== userClubId ? c : {
      ...c,
      youthSquad: (c.youthSquad || []).filter(p => p.id !== playerId),
    }
  );
}

export function applyYouthPromotion(clubs: Club[], userClubId: string, playerId: string): Club[] {
  return clubs.map(club => {
    if (club.id !== userClubId) return club;
    const ySquad = club.youthSquad || [];
    const target = ySquad.find(p => p.id === playerId);
    if (!target) return club;
    return {
      ...club,
      youthSquad: ySquad.filter(p => p.id !== playerId),
      squad: [...club.squad, { ...target, isStarting: false, isYouth: false, isFocused: false }],
    };
  });
}

export function applyYouthSignup(clubs: Club[], userClubId: string, player: Player): Club[] {
  return clubs.map(c =>
    c.id !== userClubId ? c : {
      ...c,
      youthSquad: [...(c.youthSquad || []), player],
    }
  );
}
