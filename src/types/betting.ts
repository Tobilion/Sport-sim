export type BetType =
  | '1X2_HOME' | '1X2_DRAW' | '1X2_AWAY'
  | 'OVER_2.5' | 'UNDER_2.5'
  | 'OVER_1.5' | 'UNDER_1.5'
  | 'BTTS_YES' | 'BTTS_NO'
  | 'DC_1X' | 'DC_X2' | 'DC_12';

export interface BetSelection {
  fixtureId: string;
  homeTeamName: string;
  awayTeamName: string;
  betType: BetType;
  selectedLabel: string;
  odds: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface BetTicket {
  id: string;
  selections: BetSelection[];
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  cashoutValue: number;
  isCashedOut: boolean;
  status: 'PENDING' | 'WON' | 'LOST' | 'CASHED_OUT';
  createdTime: number;
}

export interface Tipster {
  id: string;
  name: string;
  avatar: string;
  speciality: string;
  winStreak: number;
  roi: number;
  subscribers: number;
  subPrice: number;
  copiedCount: number;
  weeklyTicket: BetSelection[];
  weeklyTicketOdds: number;
  isSubscribed: boolean;
}
