export interface BracketNode {
  id: string;
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'F';
  roundIndex: number;
  homeClubId?: string;
  awayClubId?: string;
  homeScore?: number;
  awayScore?: number;
  homePens?: number;
  awayPens?: number;
  isCompleted: boolean;
  winnerClubId?: string;
  homeGoalsDetail?: string[];
  awayGoalsDetail?: string[];
  homePossession?: number;
  awayPossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
}
