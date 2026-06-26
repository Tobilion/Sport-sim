import type { Club, Fixture, BracketNode, WeatherCondition } from '../types';

export function generateWeather(): WeatherCondition {
  const roll = Math.random() * 100;
  if (roll < 40) return 'Clear Skies';
  if (roll < 60) return 'Light Rain';
  if (roll < 72) return 'Heavy Rain';
  if (roll < 82) return 'Strong Wind';
  if (roll < 90) return 'Extreme Heat';
  if (roll < 94) return 'Snow';
  if (roll < 97) return 'Night Game';
  if (roll < 99) return 'Fog';
  return 'Thunderstorm';
}

export function getTeamGroup(clubId: string, allClubs: Club[]): string {
  const idx = allClubs.findIndex(c => c.id === clubId);
  if (idx === -1 || idx >= 32) return 'None';
  return `Group ${String.fromCharCode(65 + Math.floor(idx / 4))}`;
}

export function generateTournamentGroupFixtures(allClubs: Club[]): Fixture[] {
  const fixtures: Fixture[] = [];
  let counter = 1;
  for (let g = 0; g < 8; g++) {
    const [t0, t1, t2, t3] = allClubs.slice(g * 4, g * 4 + 4);
    if (!t0 || !t1 || !t2 || !t3) continue;
    const mk = (id: string, w: number, h: string, a: string): Fixture => ({
      id, week: w, homeClubId: h, awayClubId: a, isCompleted: false, weather: generateWeather(),
    });
    fixtures.push(
      mk(`cup-g1-${counter++}`, 3, t0.id, t1.id),
      mk(`cup-g1-${counter++}`, 3, t2.id, t3.id),
      mk(`cup-g2-${counter++}`, 6, t0.id, t2.id),
      mk(`cup-g2-${counter++}`, 6, t1.id, t3.id),
      mk(`cup-g3-${counter++}`, 9, t0.id, t3.id),
      mk(`cup-g3-${counter++}`, 9, t1.id, t2.id),
    );
  }
  return fixtures;
}

export function generateCupBracket16FromGroups(qualifiers: string[]): BracketNode[] {
  const list: BracketNode[] = [];
  for (let i = 1; i <= 8; i++) {
    list.push({ id: `R16-${i}`, round: 'R16', roundIndex: i - 1, homeClubId: qualifiers[2*i-2] || undefined, awayClubId: qualifiers[2*i-1] || undefined, isCompleted: false });
  }
  for (let i = 1; i <= 4; i++) list.push({ id: `QF-${i}`, round: 'QF', roundIndex: i - 1, isCompleted: false });
  for (let i = 1; i <= 2; i++) list.push({ id: `SF-${i}`, round: 'SF', roundIndex: i - 1, isCompleted: false });
  list.push({ id: 'F-1', round: 'F', roundIndex: 0, isCompleted: false });
  return list;
}

export function getGroupStandingsForGroup(groupIndex: number, allClubs: Club[], tournamentFixtures: Fixture[]) {
  const groupTeams = allClubs.slice(groupIndex * 4, groupIndex * 4 + 4);
  const standings = groupTeams.map(club => {
    let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0, points = 0;
    tournamentFixtures.forEach(f => {
      if (!f.isCompleted) return;
      const isHome = f.homeClubId === club.id;
      const isAway = f.awayClubId === club.id;
      if (!isHome && !isAway) return;
      played++;
      const gf = isHome ? (f.homeScore || 0) : (f.awayScore || 0);
      const ga = isHome ? (f.awayScore || 0) : (f.homeScore || 0);
      goalsFor += gf; goalsAgainst += ga;
      if (gf > ga) { won++; points += 3; }
      else if (gf < ga) { lost++; }
      else { drawn++; points += 1; }
    });
    return { club, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst, points };
  });
  return standings.sort((a, b) => b.points !== a.points ? b.points - a.points : b.goalDifference !== a.goalDifference ? b.goalDifference - a.goalDifference : b.goalsFor - a.goalsFor);
}
