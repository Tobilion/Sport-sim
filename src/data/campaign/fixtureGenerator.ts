import type { Fixture } from '../../types';

// Round-robin schedule using Berger's circle method.
// Produces (numTeams - 1) rounds, one fixture per pair.
export function generateLeagueSchedule(clubIds: string[]): Fixture[] {
  const numTeams = clubIds.length;
  const fixtures: Fixture[] = [];
  const teams = [...clubIds];
  let counter = 1;

  for (let round = 1; round < numTeams; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];
      const isHome = round % 2 === 0;
      fixtures.push({
        id: `f-${counter++}`,
        week: round,
        homeClubId: isHome ? home : away,
        awayClubId: isHome ? away : home,
        isCompleted: false,
      });
    }

    // Rotate all teams except the fixed first entry
    const rest = teams.slice(1);
    const last = rest.pop();
    if (last !== undefined) teams.splice(1, teams.length - 1, last, ...rest);
  }

  return fixtures;
}
