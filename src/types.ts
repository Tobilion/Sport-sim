export type TeamMentalityType = 'Tiki-Taka' | 'Gegenpressing' | 'Park the Bus' | 'Counter-Attack';

// ── New types added in v2 overhaul ─────────────────────────────────────────

export type PersonalityTrait =
  | 'Leader'
  | 'Ambitious'
  | 'Loyal'
  | 'Professional'
  | 'Temperamental'
  | 'Mercenary'
  | 'Team Player'
  | 'Star';

export interface PlayerAmbition {
  type: 'win_league' | 'score_goals' | 'appearances' | 'win_cup';
  target: number;
  current: number;
  fulfilled: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'transfer' | 'morale' | 'injury' | 'scout' | 'match' | 'board' | 'general';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

export interface MoraleEventOption {
  label: string;
  moraleEffect: number;
  cost?: number;
}

export interface MoraleEvent {
  playerId: string;
  playerName: string;
  currentMorale: number;
  reason: string;
  options: MoraleEventOption[];
}

export interface GoalReplay {
  minute: number;
  scorer: string;
  assister?: string;
  description: string;
}

export interface PostMatchAnalysis {
  fixtureId: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  playerRatings: Record<string, number>;
  motm: string;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number;
  awayPossession: number;
  homeFouls: number;
  awayFouls: number;
  highlightsText: string;
  goalReplays: GoalReplay[];
}

export interface SeasonAward {
  season: number;
  goldenBoot: { name: string; club: string; goals: number };
  goldenGlove: { name: string; club: string; saves: number };
  bestYoungPlayer: { name: string; club: string; age: number; rating: number };
  playerOfSeason: { name: string; club: string; avgRating: number };
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

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface ManagerSkills {
  xp: number;
  level: number;
  skillPoints: number;
  tacticalMastermind: number;
  negotiator: number;
  youthDevelopment: number;
}

export interface NewsItem {
  id: string;
  week: number;
  headline: string;
  type: 'match' | 'transfer' | 'injury' | 'general';
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  age: number;
  rating: number;
  potentialRating?: number;
  isYouth?: boolean;
  isFocused?: boolean;
  focusedCoachId?: string | null;
  stamina: number; // 0 to 100
  morale: number;  // 0 to 100
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchRatings: number[];
  marketValue: number;
  attributes: PlayerAttributes;
  isStarting: boolean; // Managed by team sheet for lineups
  trainingProgress?: number; // 0 to 100
  saves: number; // GK saves (required, default 0)
  fatigue?: number; // 0-100 (100 = fully rested)
  disciplinaryRecord?: { yellowCards: number; redCards: number; suspensionGamesRemaining: number };
  tournamentGoals?: number;
  tournamentAssists?: number;
  tournamentYellowCards?: number;
  tournamentRedCards?: number;
  tournamentSaves?: number;
  appearances?: number;
  developmentLog?: { week: number; changes: Record<string, number> }[];
  // v2 fields
  personality?: PersonalityTrait;
  formStreak?: number;       // -5 to +5; positive = in form
  injuryWeeksRemaining?: number;
  injuryType?: string;
  nationality?: string;
  biography?: string;
  ambition?: PlayerAmbition;
  shirtNumber?: number;
}

export type PlaystyleType = 'Attacking' | 'Balanced' | 'Defending';

export type CoachSpeciality =
  | 'Head Coach (Tactics)'
  | 'Assistant Manager'
  | 'Attacking Coach'
  | 'Defending Coach'
  | 'Goalkeeping Coach'
  | 'Set Pieces Coach'
  | 'Fitness & Conditioning Coach'
  | 'Youth Development Coach'
  | 'Pressing & Transition Coach'
  | 'Psychological Coach'
  | 'Medical Officer'
  | 'Chief Scout'
  | 'Data Analyst'
  // Legacy values kept for compatibility
  | 'Defending' | 'Attacking' | 'Youth' | 'Tactics' | 'Fitness' | 'Goalkeeping' | 'Set Pieces' | 'Corners' | 'Development';

export interface Coach {
  id: string;
  name: string;
  age: number;
  nationality?: string;
  specialty: CoachSpeciality | string;
  rating: number; // 1 to 100
  preferredMentality?: TeamMentalityType;
  preferredPlaystyle?: string;
  personality?: string;
  wage?: number;
  contractLength?: number;
  bio?: string;
  cost: number;
}

export type TeamFormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2';

export interface Club {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  squad: Player[];
  youthSquad?: Player[];
  mentality: TeamMentalityType;
  playstyle?: PlaystyleType;
  formation?: TeamFormationType;
  trainingFacilities: number; // up to lvl 5 (Increases player stat growth)
  tacticsFacilities: number;   // up to lvl 5 (Increases tactical pass modifier)
  cardioFacilities: number;    // up to lvl 5 (Reduces stamina drain)
  medicalFacilities: number;   // up to lvl 5 (Heals stamina after matches faster)
  accommodationFacilities?: number; // up to lvl 5 (30/35/40/45/50 squad cap)
  coach: Coach;
  coaches?: Coach[];
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  streak: ('W' | 'D' | 'L')[];
  // v2 fields
  reputation?: number;         // 0–100
  wageBudget?: number;         // weekly max
  wageSpend?: number;          // current weekly total
  headToHead?: Record<string, { w: number; d: number; l: number }>;
  kitPrimaryColor?: string;
  kitSecondaryColor?: string;
  prizeMoneyEarned?: number;
}

export interface MatchEvent {
  tick: number;
  minute: number;
  type: 'goal' | 'shot_saved' | 'shot_miss' | 'foul' | 'yellow_card' | 'red_card' | 'tactical_shift' | 'stamina_warning' | 'info' | 'half_time' | 'full_time';
  teamId?: string;
  playerName?: string;
  description: string;
}

export interface LiveMatchSimulation {
  fixtureId: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  tick: number; // 0 to 30 (15 per half)
  isFinished: boolean;
  weather?: WeatherCondition;
  possession: 'home' | 'away';
  ballX: number; // 0 to 100 (0=home goal, 100=away goal)
  ballY: number; // 0 to 100
  zone: 'DEF' | 'MID' | 'ATT';
  events: MatchEvent[];
  homeShooters: string[];
  awayShooters: string[];
  // Stats
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossessionScore: number; // accumulates to yield average possession percentage
  awayPossessionScore: number;
  homeConcededFouls: number;
  awayConcededFouls: number;
  isSpectating?: boolean;
  userPlaystyle?: PlaystyleType;
  userFormation?: TeamFormationType;
}

export type WeatherCondition =
  | 'Clear Skies'
  | 'Light Rain'
  | 'Heavy Rain'
  | 'Snow'
  | 'Strong Wind'
  | 'Extreme Heat'
  | 'Night Game'
  | 'Fog'
  | 'Thunderstorm';

export interface Fixture {
  id: string;
  week: number;
  homeClubId: string;
  awayClubId: string;
  homeScore?: number;
  awayScore?: number;
  isCompleted: boolean;
  weather?: WeatherCondition;
  homeGoalsDetail?: string[]; // scorer names
  awayGoalsDetail?: string[];
  homePossession?: number;
  awayPossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homePens?: number;
  awayPens?: number;
}

export interface BracketNode {
  id: string; // e.g. 'R32-1', 'R16-1', 'QF-1', 'SF-1', 'F'
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'F';
  roundIndex: number; // 0-based index for columns/layout
  homeClubId?: string;
  awayClubId?: string;
  homeScore?: number;
  awayScore?: number;
  homePens?: number; // Shootout results
  awayPens?: number;
  isCompleted: boolean;
  winnerClubId?: string;
  // Match stats (optional — populated after simulation)
  homeGoalsDetail?: string[];
  awayGoalsDetail?: string[];
  homePossession?: number;
  awayPossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
}

export interface TransferPlayer {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  rating: number;
  stamina: number;
  morale: number;
  marketValue: number;
  clubName: string; // From which club, or 'Free Agent'
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

export type BetType = '1X2_HOME' | '1X2_DRAW' | '1X2_AWAY' | 'OVER_2.5' | 'UNDER_2.5' | 'OVER_1.5' | 'UNDER_1.5' | 'BTTS_YES' | 'BTTS_NO' | 'DC_1X' | 'DC_X2' | 'DC_12';

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

export interface LiveOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
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
