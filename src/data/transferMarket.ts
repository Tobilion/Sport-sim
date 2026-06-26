/**
 * transferMarket.ts
 * Pre-generated global transfer market pool: 70+ outfield players, 12 GKs,
 * 30 youth prospects, 20 hireable coaches. Fog-of-war scouting system built in.
 */

import { Player, Coach } from '../types';
import { randRange, generateUniquePlayerName, generatePlayerAttributes, FIRST_NAMES, LAST_NAMES } from './names';

// ── Nationality pools by region ──────────────────────────────────────────────
const NATIONALITIES: Record<string, string[]> = {
  Europe: ['England', 'Spain', 'Germany', 'France', 'Italy', 'Portugal', 'Netherlands', 'Belgium', 'Norway', 'Denmark', 'Croatia', 'Austria', 'Poland', 'Sweden', 'Serbia'],
  SouthAmerica: ['Brazil', 'Argentina', 'Colombia', 'Uruguay', 'Chile', 'Ecuador', 'Paraguay', 'Peru', 'Venezuela', 'Bolivia'],
  Africa: ['Nigeria', 'Senegal', 'Ghana', 'Ivory Coast', 'Morocco', 'Egypt', 'Cameroon', 'Mali', 'Guinea', 'Tunisia', 'Zambia', 'South Africa'],
  Asia: ['South Korea', 'Japan', 'China', 'Saudi Arabia', 'Iran', 'Australia', 'Qatar', 'UAE', 'Iraq'],
  NorthAmerica: ['USA', 'Mexico', 'Canada', 'Jamaica', 'Costa Rica', 'Panama', 'Honduras'],
};

const ALL_NATIONALITIES = Object.values(NATIONALITIES).flat();

const randomNationality = (region?: keyof typeof NATIONALITIES): string => {
  if (region && NATIONALITIES[region]) {
    const pool = NATIONALITIES[region];
    return pool[randRange(0, pool.length - 1)];
  }
  return ALL_NATIONALITIES[randRange(0, ALL_NATIONALITIES.length - 1)];
};

// ── Realistic market value calculator ────────────────────────────────────────
// Calibrated so rating 95 (prime, 23yo) ≈ $200M, rating 60 ≈ $500K
// Age mult: youth premium peaks at ~22, 28+ gets a discount
export function calcRealisticMarketValue(rating: number, age: number): number {
  const base = 17 * Math.exp(0.1712 * rating);
  const ageMult = Math.max(0.2, 1.4 - (age - 20) * 0.07);
  const variance = 0.9 + Math.random() * 0.2; // ±10% noise
  return Math.round((base * ageMult * variance) / 500_000) * 500_000;
}

// ── Market player factory ─────────────────────────────────────────────────────
function makeMarketPlayer(
  idx: number,
  pos: 'GK' | 'DEF' | 'MID' | 'ATT',
  ratingMin: number,
  ratingMax: number,
  ageMin: number,
  ageMax: number,
  isYouth = false,
): Player {
  const name = generateUniquePlayerName();
  const rating = randRange(ratingMin, ratingMax);
  const age = randRange(ageMin, ageMax);
  const potentialRating = isYouth
    ? Math.min(99, rating + randRange(18, 32))
    : Math.min(99, rating + randRange(2, 12));
  const marketValue = Math.max(100_000, calcRealisticMarketValue(rating, age));

  return {
    id: `market-${pos.toLowerCase()}-${idx}-${Date.now()}-${randRange(100, 9999)}`,
    name,
    position: pos,
    age,
    rating,
    potentialRating,
    isYouth,
    stamina: randRange(80, 100),
    morale: randRange(65, 95),
    goals: 0,
    assists: 0,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    matchRatings: [],
    marketValue,
    attributes: generatePlayerAttributes(pos, rating),
    isStarting: false,
    fatigue: 100,
    appearances: 0,
    nationality: randomNationality(),
    personality: (['Leader', 'Ambitious', 'Loyal', 'Professional', 'Temperamental', 'Mercenary', 'Team Player', 'Star'] as const)[randRange(0, 7)],
    formStreak: 0,
  };
}

// ── Generate the full market pool ────────────────────────────────────────────
let _cachedMarket: Player[] | null = null;
let _cachedYouth: Player[] | null = null;

export function getTransferMarketPool(): Player[] {
  if (_cachedMarket) return _cachedMarket;

  const pool: Player[] = [];
  let idx = 0;

  // 12 Goalkeepers — mix of elite, mid-range, budget
  for (let i = 0; i < 4; i++) pool.push(makeMarketPlayer(idx++, 'GK', 82, 92, 22, 30));
  for (let i = 0; i < 4; i++) pool.push(makeMarketPlayer(idx++, 'GK', 73, 82, 24, 34));
  for (let i = 0; i < 4; i++) pool.push(makeMarketPlayer(idx++, 'GK', 64, 73, 20, 32));

  // 24 Defenders
  for (let i = 0; i < 6; i++) pool.push(makeMarketPlayer(idx++, 'DEF', 84, 93, 22, 29));
  for (let i = 0; i < 10; i++) pool.push(makeMarketPlayer(idx++, 'DEF', 74, 84, 21, 33));
  for (let i = 0; i < 8; i++) pool.push(makeMarketPlayer(idx++, 'DEF', 64, 74, 19, 30));

  // 24 Midfielders
  for (let i = 0; i < 6; i++) pool.push(makeMarketPlayer(idx++, 'MID', 85, 94, 21, 28));
  for (let i = 0; i < 10; i++) pool.push(makeMarketPlayer(idx++, 'MID', 75, 85, 20, 32));
  for (let i = 0; i < 8; i++) pool.push(makeMarketPlayer(idx++, 'MID', 65, 75, 19, 30));

  // 22 Attackers
  for (let i = 0; i < 6; i++) pool.push(makeMarketPlayer(idx++, 'ATT', 85, 95, 20, 28));
  for (let i = 0; i < 10; i++) pool.push(makeMarketPlayer(idx++, 'ATT', 75, 85, 21, 32));
  for (let i = 0; i < 6; i++) pool.push(makeMarketPlayer(idx++, 'ATT', 65, 75, 19, 30));

  _cachedMarket = pool;
  return pool;
}

export function getYouthMarketPool(): Player[] {
  if (_cachedYouth) return _cachedYouth;

  const pool: Player[] = [];
  const positions: ('GK' | 'DEF' | 'MID' | 'ATT')[] = ['GK', 'DEF', 'MID', 'ATT'];
  for (let i = 0; i < 30; i++) {
    const pos = positions[randRange(0, 3)];
    pool.push(makeMarketPlayer(i, pos, 50, 68, 15, 18, true));
  }
  _cachedYouth = pool;
  return pool;
}

export function refreshMarketPool(): Player[] {
  _cachedMarket = null;
  _cachedYouth = null;
  return getTransferMarketPool();
}

// ── Pre-generated starting youth academy ─────────────────────────────────────
export function generateStartingYouthAcademy(clubId: string): Player[] {
  const positions: ('GK' | 'DEF' | 'MID' | 'ATT')[] = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'ATT', 'ATT', 'ATT', 'DEF'];
  return positions.map((pos, i) => {
    const rating = randRange(48, 65);
    const age = randRange(15, 18);
    const name = generateUniquePlayerName();
    return {
      id: `${clubId}-academy-${i}-${Date.now()}`,
      name,
      position: pos,
      age,
      rating,
      potentialRating: Math.min(99, rating + randRange(20, 35)),
      isYouth: true,
      stamina: randRange(85, 100),
      morale: randRange(75, 95),
      goals: 0,
      assists: 0,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      matchRatings: [],
      marketValue: randRange(1, 4) * 100000,
      attributes: generatePlayerAttributes(pos, rating),
      isStarting: false,
      fatigue: 100,
      appearances: 0,
      nationality: randomNationality(),
      personality: (['Leader', 'Ambitious', 'Loyal', 'Professional', 'Team Player'] as const)[randRange(0, 4)],
      formStreak: 0,
      developmentLog: [],
    };
  });
}

// ── Extended coach hiring pool ────────────────────────────────────────────────
const COACH_FIRST = ['Luca', 'Marco', 'Carlos', 'Andre', 'Stefan', 'Thomas', 'Miro', 'Pascal', 'Yusuf', 'Johan',
  'Franck', 'Diego', 'Rafael', 'Emil', 'Jorge', 'Bruno', 'Sven', 'Niklas', 'Damien', 'Victor'];
const COACH_LAST = ['Ricci', 'Bauer', 'Gomez', 'Favre', 'Kovac', 'Muller', 'Blanc', 'Ferreira', 'Yildiz', 'Cruyff',
  'Zidane', 'Maradona', 'Ronaldo', 'Lindqvist', 'Silva', 'Fernandes', 'Larsson', 'Schmidt', 'Deschamps', 'Moreno'];

const COACH_SPECIALITIES: Coach['specialty'][] = [
  'Head Coach (Tactics)', 'Attacking Coach', 'Defending Coach', 'Goalkeeping Coach',
  'Set Pieces Coach', 'Fitness & Conditioning Coach', 'Youth Development Coach',
  'Pressing & Transition Coach', 'Psychological Coach', 'Medical Officer',
  'Chief Scout', 'Data Analyst', 'Assistant Manager',
];

let _cachedCoaches: Coach[] | null = null;

export function getHireableCoaches(): Coach[] {
  if (_cachedCoaches) return _cachedCoaches;

  const coaches: Coach[] = [];
  for (let i = 0; i < 25; i++) {
    const firstName = COACH_FIRST[randRange(0, COACH_FIRST.length - 1)];
    const lastName = COACH_LAST[randRange(0, COACH_LAST.length - 1)];
    const rating = randRange(55, 90);
    const specialty = COACH_SPECIALITIES[randRange(0, COACH_SPECIALITIES.length - 1)];
    const age = randRange(36, 65);
    const wage = Math.round((rating * 800 + randRange(0, 5000)) / 500) * 500;

    coaches.push({
      id: `hireable-coach-${i}-${Date.now()}`,
      name: `${firstName} ${lastName}`,
      age,
      nationality: randomNationality(),
      specialty,
      rating,
      preferredMentality: (['Tiki-Taka', 'Gegenpressing', 'Counter-Attack', 'Park the Bus'] as const)[randRange(0, 3)],
      preferredPlaystyle: (['Attacking', 'Balanced', 'Defending'] as const)[randRange(0, 2)],
      personality: (['Disciplinarian', 'Motivator', 'Analyst', "Players' Coach"] as const)[randRange(0, 3)],
      wage,
      contractLength: randRange(1, 3),
      bio: `${age} year old ${specialty} specialist. ${rating >= 80 ? 'Highly sought-after.' : rating >= 70 ? 'Experienced and reliable.' : 'Hungry to prove himself at the top level.'}`,
      cost: wage * 52,
    });
  }

  _cachedCoaches = coaches;
  return coaches;
}

export function refreshCoachPool(): Coach[] {
  _cachedCoaches = null;
  return getHireableCoaches();
}
