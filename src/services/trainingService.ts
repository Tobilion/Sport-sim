import type { Club } from '../types';

/** Toggle individual player focus (max 3 at once). Returns unchanged clubs if cap reached. */
export function applyPlayerFocusToggle(clubs: Club[], userClubId: string, playerId: string): Club[] {
  return clubs.map(club => {
    if (club.id !== userClubId) return club;
    const isCurrentlyFocused = club.squad.find(p => p.id === playerId)?.isFocused ?? false;
    const focusCount = club.squad.filter(p => p.isFocused).length;
    if (!isCurrentlyFocused && focusCount >= 3) return club; // cap
    return {
      ...club,
      squad: club.squad.map(p => p.id === playerId ? { ...p, isFocused: !p.isFocused } : p),
    };
  });
}

/** Assign or unassign a coach to a player (max 6 assignments). */
export function applyCoachAssignment(
  clubs: Club[],
  userClubId: string,
  playerId: string,
  coachId: string | null,
): Club[] {
  return clubs.map(club => {
    if (club.id !== userClubId) return club;
    const alreadyAssigned = club.squad.filter(p => p.focusedCoachId).length;
    const player = club.squad.find(p => p.id === playerId);
    const wasFocused = !!player?.focusedCoachId;
    if (coachId && !wasFocused && alreadyAssigned >= 6) return club; // cap
    return {
      ...club,
      squad: club.squad.map(p => {
        if (p.id === playerId) return { ...p, focusedCoachId: coachId, isFocused: !!coachId };
        // Unassign the same coach from another player
        if (p.focusedCoachId === coachId && coachId !== null) return { ...p, focusedCoachId: null, isFocused: false };
        return p;
      }),
    };
  });
}
