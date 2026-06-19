import { Club, Player, Fixture, BracketNode, CampaignState, TeamMentalityType } from '../types';
import { seedAllClubs, randRange } from './names';

// Generates an Elite League schedule for 16 teams over 15 weeks (Circle Method)
export function generateLeagueSchedule(clubIds: string[]): Fixture[] {
  const numTeams = clubIds.length;
  const fixtures: Fixture[] = [];
  const teams = [...clubIds];
  let fixtureIdCounter = 1;

  // Round Robin Berger scheduling algorithm
  for (let round = 1; round < numTeams; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];

      // Alternate home/away sides to balance calendar
      const isHome = round % 2 === 0;
      fixtures.push({
        id: `f-${fixtureIdCounter++}`,
        week: round,
        homeClubId: isHome ? home : away,
        awayClubId: isHome ? away : home,
        isCompleted: false
      });
    }

    // Rotate teams (leave first team fixed)
    const first = teams[0];
    const rest = teams.slice(1);
    const last = rest.pop();
    if (last !== undefined) {
      teams.splice(1, teams.length - 1, last, ...rest);
    }
  }

  return fixtures;
}

// Generates initial 32-team Cup Bracket starting from Round of 32
export function generateCupBracket(clubIds: string[]): BracketNode[] {
  const bracket: BracketNode[] = [];
  const r32Teams = [...clubIds].slice(0, 32);

  // Pad to 32 teams if we have less (though seedAllClubs seeds 32 teams)
  while (r32Teams.length < 32) {
    r32Teams.push(`placeholder-${r32Teams.length}`);
  }

  // Shuffle teams for dynamic pairing
  for (let i = r32Teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r32Teams[i], r32Teams[j]] = [r32Teams[j], r32Teams[i]];
  }

  // Round of 32 has 16 matches
  for (let i = 0; i < 16; i++) {
    bracket.push({
      id: `cup-R32-${i + 1}`,
      round: 'R32',
      roundIndex: i,
      homeClubId: r32Teams[i * 2],
      awayClubId: r32Teams[i * 2 + 1],
      isCompleted: false
    });
  }

  // Round of 16 empty nodes (8 matches)
  for (let i = 0; i < 8; i++) {
    bracket.push({ id: `cup-R16-${i + 1}`, round: 'R16', roundIndex: i, isCompleted: false });
  }

  // Quarterfinals (4 matches)
  for (let i = 0; i < 4; i++) {
    bracket.push({ id: `cup-QF-${i + 1}`, round: 'QF', roundIndex: i, isCompleted: false });
  }

  // Semifinals (2 matches)
  for (let i = 0; i < 2; i++) {
    bracket.push({ id: `cup-SF-${i + 1}`, round: 'SF', roundIndex: i, isCompleted: false });
  }

  // Final (1 match)
  bracket.push({ id: `cup-F-1`, round: 'F', roundIndex: 0, isCompleted: false });

  return bracket;
}

// Advances winners to next stage of the cup
export function advanceCupRound(bracket: BracketNode[], activeRound: BracketNode['round']): { updatedBracket: BracketNode[], nextRound: BracketNode['round'] | 'FINISHED' } {
  const updatedBracket = [...bracket];
  
  if (activeRound === 'R32') {
    // Collect 16 winners
    const winners = updatedBracket.filter(b => b.round === 'R32').map(b => b.winnerClubId);
    // Pop them into R16 matches
    for (let i = 0; i < 8; i++) {
      const matchNode = updatedBracket.find(b => b.id === `cup-R16-${i + 1}`);
      if (matchNode) {
        matchNode.homeClubId = winners[i * 2] || undefined;
        matchNode.awayClubId = winners[i * 2 + 1] || undefined;
      }
    }
    return { updatedBracket, nextRound: 'R16' };
  }
  
  if (activeRound === 'R16') {
    const winners = updatedBracket.filter(b => b.round === 'R16').map(b => b.winnerClubId);
    for (let i = 0; i < 4; i++) {
      const matchNode = updatedBracket.find(b => b.id === `cup-QF-${i + 1}`);
      if (matchNode) {
        matchNode.homeClubId = winners[i * 2] || undefined;
        matchNode.awayClubId = winners[i * 2 + 1] || undefined;
      }
    }
    return { updatedBracket, nextRound: 'QF' };
  }
  
  if (activeRound === 'QF') {
    const winners = updatedBracket.filter(b => b.round === 'QF').map(b => b.winnerClubId);
    for (let i = 0; i < 2; i++) {
      const matchNode = updatedBracket.find(b => b.id === `cup-SF-${i + 1}`);
      if (matchNode) {
        matchNode.homeClubId = winners[i * 2] || undefined;
        matchNode.awayClubId = winners[i * 2 + 1] || undefined;
      }
    }
    return { updatedBracket, nextRound: 'SF' };
  }
  
  if (activeRound === 'SF') {
    const winners = updatedBracket.filter(b => b.round === 'SF').map(b => b.winnerClubId);
    const matchNode = updatedBracket.find(b => b.id === 'cup-F-1');
    if (matchNode) {
      matchNode.homeClubId = winners[0] || undefined;
      matchNode.awayClubId = winners[1] || undefined;
    }
    return { updatedBracket, nextRound: 'F' };
  }
  
  return { updatedBracket, nextRound: 'FINISHED' };
}

// Full LocalStorage hydration helper
export function loadCampaignFromStorage(): { campaign: CampaignState, clubs: Club[] } | null {
  try {
    const campaignData = localStorage.getItem('sport_sim_pro_campaign');
    const clubsData = localStorage.getItem('sport_sim_pro_clubs');
    if (campaignData && clubsData) {
      return {
        campaign: JSON.parse(campaignData),
        clubs: JSON.parse(clubsData)
      };
    }
  } catch (error) {
    console.error('Failed to load campaign from localStorage', error);
  }
  return null;
}

export function saveCampaignToStorage(campaign: CampaignState, clubs: Club[]): void {
  try {
    localStorage.setItem('sport_sim_pro_campaign', JSON.stringify(campaign));
    localStorage.setItem('sport_sim_pro_clubs', JSON.stringify(clubs));
  } catch (error) {
    console.error('Failed to save campaign to localStorage', error);
  }
}
