import type { Club, Fixture, LiveMatchSimulation, BracketNode, ManagerSkills } from '../types';
import { quickSimulateFixture, runAssistantSubstitution } from '../engine/matchEngine';

/** Build the initial LiveMatchSimulation object when a user kicks off a live match. */
export function buildInitialLiveMatch(
  fixtureId: string,
  homeId: string,
  awayId: string,
  userClubId: string,
  weather?: string,
  isSpectating?: boolean,
): LiveMatchSimulation {
  return {
    fixtureId,
    homeClubId: homeId,
    awayClubId: awayId,
    homeScore: 0,
    awayScore: 0,
    tick: 0,
    isFinished: false,
    weather: weather as any,
    possession: 'home',
    ballX: 50,
    ballY: 50,
    zone: 'MID',
    events: [{ tick: 0, minute: 0, type: 'info', description: 'Referee checks watch. Official Kickoff has begun!' }],
    homeShooters: [],
    awayShooters: [],
    homeShots: 0,
    awayShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homePossessionScore: 50,
    awayPossessionScore: 50,
    homeConcededFouls: 0,
    awayConcededFouls: 0,
    isSpectating: isSpectating || (homeId !== userClubId && awayId !== userClubId),
  };
}

function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Build a mock finished sim from a quick-sim result (skip/quick-sim path). */
export function buildSkipSimResult(
  active: LiveMatchSimulation,
  homeClub: Club,
  awayClub: Club,
): LiveMatchSimulation {
  runAssistantSubstitution(homeClub);
  runAssistantSubstitution(awayClub);
  const result = quickSimulateFixture(homeClub, awayClub, active.fixtureId);
  return {
    ...active,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    isFinished: true,
    homeShooters: Array(result.homeScore).fill('Assigned Scorer'),
    awayShooters: Array(result.awayScore).fill('Assigned Scorer'),
    homePossessionScore: 50,
    awayPossessionScore: 50,
    homeShots: randRange(8, 14),
    awayShots: randRange(8, 14),
  };
}

/** Build a mock finished sim from an explicit quick-sim (Next Match tab). */
export function buildQuickSimResult(
  fixtureId: string,
  homeId: string,
  awayId: string,
  homeClub: Club,
  awayClub: Club,
): LiveMatchSimulation {
  runAssistantSubstitution(homeClub);
  runAssistantSubstitution(awayClub);
  const result = quickSimulateFixture(homeClub, awayClub, fixtureId);
  return {
    fixtureId,
    homeClubId: homeId,
    awayClubId: awayId,
    homeScore: result.homeScore ?? 0,
    awayScore: result.awayScore ?? 0,
    tick: 30,
    isFinished: true,
    possession: 'home',
    ballX: 50,
    ballY: 50,
    zone: 'MID',
    events: [{ tick: 30, minute: 90, type: 'info', description: 'Quick match simulation settled successfully.' }],
    homeShooters: result.homeGoalsDetail || Array(result.homeScore ?? 0).fill(''),
    awayShooters: result.awayGoalsDetail || Array(result.awayScore ?? 0).fill(''),
    homeShots: result.homeShots ?? 0,
    awayShots: result.awayShots ?? 0,
    homeShotsOnTarget: result.homeShotsOnTarget ?? 0,
    awayShotsOnTarget: result.awayShotsOnTarget ?? 0,
    homePossessionScore: result.homePossession ?? 50,
    awayPossessionScore: result.awayPossession ?? 50,
    homeConcededFouls: randRange(3, 8),
    awayConcededFouls: randRange(3, 8),
    isSpectating: false,
  };
}

export interface MatchRewardResult {
  nextBalance: number;
  nextManagerSkills: ManagerSkills;
  consecutiveLossesChange: number; // +1, -1 (reset to 0) or 0
  boardWarning: boolean;
}

/** Pure calculation of financial/XP rewards for a user's completed match. */
export function calcMatchRewards(
  finalSim: LiveMatchSimulation,
  userClubId: string,
  userBalance: number,
  managerSkills: ManagerSkills,
  clubs: Club[],
  isLeagueMatch: boolean,
): MatchRewardResult | null {
  const isUserPlaying = finalSim.homeClubId === userClubId || finalSim.awayClubId === userClubId;
  if (!isUserPlaying) return null;

  let reward = 2200;
  let skills = { ...managerSkills };
  let lossChange = 0;
  let boardWarning = false;

  const userWon = (finalSim.homeClubId === userClubId && finalSim.homeScore > finalSim.awayScore)
    || (finalSim.awayClubId === userClubId && finalSim.awayScore > finalSim.homeScore);
  const userDrawn = finalSim.homeScore === finalSim.awayScore;
  const userLost = !userWon && !userDrawn;

  if (userWon) {
    reward += 2800;
    skills.xp += 150;
    lossChange = -999; // signal: reset to 0
  } else if (userDrawn) {
    skills.xp += 50;
    lossChange = -999;
  } else if (userLost) {
    skills.xp += 25;
    lossChange = 1;
    boardWarning = true; // caller checks against threshold
  }

  if (skills.xp >= skills.level * 1000) {
    skills.level += 1;
    skills.skillPoints += 1;
    skills.xp -= (skills.level - 1) * 1000;
  }

  const userClubObj = clubs.find(c => c.id === userClubId);
  const rep = userClubObj?.reputation ?? 50;
  const matchdayRev = Math.round(rep * 800 + (Math.random() * 20000 + 5000));
  reward += matchdayRev;
  if (!isLeagueMatch) reward += 1500;

  return {
    nextBalance: userBalance + reward,
    nextManagerSkills: skills,
    consecutiveLossesChange: lossChange,
    boardWarning,
  };
}

/** Apply final match ratings to both squads' starting players. */
export function applyMatchRatings(
  homeClub: Club,
  awayClub: Club,
  finalSim: LiveMatchSimulation,
): { homeClub: Club; awayClub: Club } {
  const diff = finalSim.homeScore - finalSim.awayScore;
  const randRange = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

  const rate = (club: Club, sign: 1 | -1) => ({
    ...club,
    squad: club.squad.map(p => {
      if (!p.isStarting) return p;
      const r = randRange(64, 84) / 10 + sign * diff * 0.3 + p.goals * 1.5 + p.assists * 1.0;
      return { ...p, matchRatings: [...(p.matchRatings || []), Number(Math.min(10, Math.max(3, r)).toFixed(1))] };
    }),
  });

  return { homeClub: rate(homeClub, 1), awayClub: rate(awayClub, -1) };
}

/** Update league table stats for both clubs after a match. Mutates the objects (already copies in callers). */
export function applyTableStats(
  homeClub: Club,
  awayClub: Club,
  homeScore: number,
  awayScore: number,
): void {
  homeClub.played++;
  awayClub.played++;
  homeClub.goalsFor += homeScore;
  homeClub.goalsAgainst += awayScore;
  awayClub.goalsFor += awayScore;
  awayClub.goalsAgainst += homeScore;
  homeClub.goalDifference = homeClub.goalsFor - homeClub.goalsAgainst;
  awayClub.goalDifference = awayClub.goalsFor - awayClub.goalsAgainst;

  if (homeScore > awayScore) {
    homeClub.won++; homeClub.points += 3; homeClub.streak = [...(homeClub.streak || []), 'W'];
    awayClub.lost++;                       awayClub.streak = [...(awayClub.streak || []), 'L'];
  } else if (homeScore < awayScore) {
    awayClub.won++; awayClub.points += 3; awayClub.streak = [...(awayClub.streak || []), 'W'];
    homeClub.lost++;                       homeClub.streak = [...(homeClub.streak || []), 'L'];
  } else {
    homeClub.drawn++; homeClub.points += 1; homeClub.streak = [...(homeClub.streak || []), 'D'];
    awayClub.drawn++; awayClub.points += 1; awayClub.streak = [...(awayClub.streak || []), 'D'];
  }
}

/** Apply form streak updates to the user's club players after a match. */
export function applyFormStreaks(clubs: Club[], userClubId: string, finalSim: LiveMatchSimulation): Club[] {
  return clubs.map(club => {
    if (club.id !== userClubId) return club;
    return {
      ...club,
      squad: club.squad.map(p => {
        if (!p.isStarting) return p;
        const lastRating = p.matchRatings[p.matchRatings.length - 1] || 6.0;
        let delta = 0;
        if (lastRating >= 7.0) delta = 1;
        else if (lastRating <= 5.5) delta = -1;
        return { ...p, formStreak: Math.max(-5, Math.min(5, (p.formStreak || 0) + delta)) };
      }),
    };
  });
}

/** Settle a single fixture object from a finalSim. */
export function settleLeagueFixture(fixture: Fixture, finalSim: LiveMatchSimulation): Fixture {
  const homePoss = Math.round(
    (finalSim.homePossessionScore / ((finalSim.homePossessionScore + finalSim.awayPossessionScore) || 1)) * 100
  );
  return {
    ...fixture,
    isCompleted: true,
    homeScore: finalSim.homeScore,
    awayScore: finalSim.awayScore,
    homeGoalsDetail: finalSim.homeShooters,
    awayGoalsDetail: finalSim.awayShooters,
    homePossession: homePoss,
    awayPossession: 100 - homePoss,
    homeShots: finalSim.homeShots,
    awayShots: finalSim.awayShots,
    homeShotsOnTarget: finalSim.homeShotsOnTarget,
    awayShotsOnTarget: finalSim.awayShotsOnTarget,
  };
}

/** Settle a bracket node after a knockout match (with optional penalty resolution). */
export function settleBracketNode(node: BracketNode, finalSim: LiveMatchSimulation): BracketNode {
  let winnerId = finalSim.homeScore > finalSim.awayScore ? finalSim.homeClubId : finalSim.awayClubId;
  let hPens: number | undefined;
  let aPens: number | undefined;
  if (finalSim.homeScore === finalSim.awayScore) {
    hPens = Math.floor(Math.random() * 3) + 3;
    aPens = hPens === 5 ? Math.floor(Math.random() * 3) + 2 : 5;
    winnerId = hPens > aPens ? finalSim.homeClubId : finalSim.awayClubId;
  }
  return {
    ...node,
    isCompleted: true,
    homeScore: finalSim.homeScore,
    awayScore: finalSim.awayScore,
    homePens: hPens,
    awayPens: aPens,
    winnerClubId: winnerId,
  };
}
