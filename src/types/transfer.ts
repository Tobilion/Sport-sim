export interface TransferPlayer {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  rating: number;
  stamina: number;
  morale: number;
  marketValue: number;
  clubName: string;
}

export interface TransferRumour {
  id: string;
  playerId: string;
  playerName: string;
  playerRating: number;
  fromClub: string;
  toClub: string;
  week: number;
  status: 'rumour' | 'confirmed' | 'denied';
}
