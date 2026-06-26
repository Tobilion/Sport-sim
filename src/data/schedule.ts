import type { Fixture, WeatherCondition } from '../types';

export const DUAL_SCHEDULE = [
  { week: 1,  type: 'league',     label: 'League Matchday 1' },
  { week: 2,  type: 'league',     label: 'League Matchday 2' },
  { week: 3,  type: 'tournament', label: 'Prestige Champions Cup - Group Stage R1', stage: 'Group' },
  { week: 4,  type: 'league',     label: 'League Matchday 3' },
  { week: 5,  type: 'league',     label: 'League Matchday 4' },
  { week: 6,  type: 'tournament', label: 'Prestige Champions Cup - Group Stage R2', stage: 'Group' },
  { week: 7,  type: 'league',     label: 'League Matchday 5' },
  { week: 8,  type: 'league',     label: 'League Matchday 6' },
  { week: 9,  type: 'tournament', label: 'Prestige Champions Cup - Group Stage R3', stage: 'Group' },
  { week: 10, type: 'league',     label: 'League Matchday 7' },
  { week: 11, type: 'league',     label: 'League Matchday 8' },
  { week: 12, type: 'tournament', label: 'Prestige Champions Cup - Round of 16',     stage: 'R16' },
  { week: 13, type: 'league',     label: 'League Matchday 9' },
  { week: 14, type: 'league',     label: 'League Matchday 10' },
  { week: 15, type: 'tournament', label: 'Prestige Champions Cup - Quarter-Finals',  stage: 'QF' },
  { week: 16, type: 'league',     label: 'League Matchday 11' },
  { week: 17, type: 'league',     label: 'League Matchday 12' },
  { week: 18, type: 'tournament', label: 'Prestige Champions Cup - Semi-Finals',     stage: 'SF' },
  { week: 19, type: 'league',     label: 'League Matchday 13' },
  { week: 20, type: 'league',     label: 'League Matchday 14' },
  { week: 21, type: 'tournament', label: 'Prestige Champions Cup - Champions Grand Final', stage: 'F' },
  { week: 22, type: 'league',     label: 'League Matchday 15' },
  { week: 23, type: 'league',     label: 'League Matchday 16' },
  { week: 24, type: 'league',     label: 'League Matchday 17' },
  { week: 25, type: 'league',     label: 'League Matchday 18' },
  { week: 26, type: 'league',     label: 'League Matchday 19' },
];

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
