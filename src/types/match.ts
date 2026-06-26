import type { PlaystyleType, TeamFormationType } from './shared';

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
  homeGoalsDetail?: string[];
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
  tick: number;
  isFinished: boolean;
  weather?: WeatherCondition;
  possession: 'home' | 'away';
  ballX: number;
  ballY: number;
  zone: 'DEF' | 'MID' | 'ATT';
  events: MatchEvent[];
  homeShooters: string[];
  awayShooters: string[];
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossessionScore: number;
  awayPossessionScore: number;
  homeConcededFouls: number;
  awayConcededFouls: number;
  isSpectating?: boolean;
  userPlaystyle?: PlaystyleType;
  userFormation?: TeamFormationType;
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

export interface LiveOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
}
