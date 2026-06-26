import type { Fixture } from './match';
import type { BracketNode } from './cup';

export interface SeasonAward {
  season: number;
  goldenBoot: { name: string; club: string; goals: number };
  goldenGlove: { name: string; club: string; saves: number };
  bestYoungPlayer: { name: string; club: string; age: number; rating: number };
  playerOfSeason: { name: string; club: string; avgRating: number };
}

export interface TrophyRecord {
  season: number;
  leagueWinner: string;
  leagueWinnerColor: string;
  tournamentWinner: string;
  tournamentWinnerColor: string;
  goldenBootName: string;
  goldenBootClub: string;
  goldenBootGoals: number;
  goldenGloveName: string;
  goldenGloveClub: string;
  goldenGloveSaves: number;
}

export interface CampaignState {
  currentCampaign: 'league' | 'cup';
  userClubId: string;
  userBalance: number;
  leagueSettings: {
    currentWeek: number;
    fixtures: Fixture[];
  };
  cupSettings: {
    bracket: BracketNode[];
    currentRound: 'R32' | 'R16' | 'QF' | 'SF' | 'F';
  };
}
