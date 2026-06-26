import type { Club, Fixture, BracketNode } from '../types';
import { quickSimulateFixture } from '../engine/matchEngine';
import { applyTableStats } from './simulationService';

function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applyFixtureResult(target: Fixture, result: Fixture): void {
  target.homeScore = result.homeScore;
  target.awayScore = result.awayScore;
  target.isCompleted = true;
  target.homeGoalsDetail = result.homeGoalsDetail;
  target.awayGoalsDetail = result.awayGoalsDetail;
  target.homePossession = result.homePossession;
  target.awayPossession = result.awayPossession;
  target.homeShots = result.homeShots;
  target.awayShots = result.awayShots;
  target.homeShotsOnTarget = result.homeShotsOnTarget;
  target.awayShotsOnTarget = result.awayShotsOnTarget;
}

export interface AdvanceWeekResult {
  updatedClubs: Club[];
  updatedFixtures: Fixture[];
  updatedTournamentFixtures: Fixture[];
  updatedBracket: BracketNode[];
  updatedCupRound: string;
  cupFinished: boolean;
  cupWinnerId?: string;
}

/** Simulate all pending league fixtures for a given week. Mutates copies. */
export function advanceLeagueWeek(
  clubs: Club[],
  fixtures: Fixture[],
  currentWeek: number,
): { updatedClubs: Club[]; updatedFixtures: Fixture[] } {
  const updatedClubs = [...clubs];
  const updatedFixtures = [...fixtures];

  updatedFixtures
    .filter(f => f.week === currentWeek && !f.isCompleted)
    .forEach(fix => {
      const hC = updatedClubs.find(c => c.id === fix.homeClubId)!;
      const aC = updatedClubs.find(c => c.id === fix.awayClubId)!;
      const result = quickSimulateFixture(hC, aC);
      applyFixtureResult(fix, result);
      applyTableStats(hC, aC, result.homeScore, result.awayScore);
    });

  return { updatedClubs, updatedFixtures };
}

/** Simulate all pending cup group fixtures for a given week. */
export function advanceCupGroupWeek(
  clubs: Club[],
  tournamentFixtures: Fixture[],
  currentWeek: number,
): { updatedClubs: Club[]; updatedTournamentFixtures: Fixture[] } {
  const updatedClubs = [...clubs];
  const updatedTournamentFixtures = [...tournamentFixtures];

  updatedTournamentFixtures
    .filter(f => f.week === currentWeek && !f.isCompleted)
    .forEach(fix => {
      const hC = updatedClubs.find(c => c.id === fix.homeClubId)!;
      const aC = updatedClubs.find(c => c.id === fix.awayClubId)!;
      const result = quickSimulateFixture(hC, aC, fix.id);
      applyFixtureResult(fix, result);
    });

  return { updatedClubs, updatedTournamentFixtures };
}

/** Simulate all pending knockout bracket nodes for the active round. */
export function advanceBracketWeek(
  clubs: Club[],
  bracket: BracketNode[],
  currentCupRound: string,
): { updatedBracket: BracketNode[]; nextCupRound: string; cupFinished: boolean; cupWinnerId?: string } {
  const updatedBracket = bracket.map(n => ({ ...n }));

  updatedBracket
    .filter(n => n.round === currentCupRound && !n.isCompleted)
    .forEach(node => {
      const hId = node.homeClubId || '';
      const aId = node.awayClubId || '';
      if (!hId || !aId) {
        node.isCompleted = true;
        node.winnerClubId = hId || aId || clubs[0].id;
        return;
      }
      const hC = clubs.find(c => c.id === hId)!;
      const aC = clubs.find(c => c.id === aId)!;
      const result = quickSimulateFixture(hC, aC);
      node.homeScore = result.homeScore;
      node.awayScore = result.awayScore;
      node.isCompleted = true;
      applyFixtureResult(node as any, result);
      if (result.homeScore > result.awayScore) {
        node.winnerClubId = hId;
      } else if (result.homeScore < result.awayScore) {
        node.winnerClubId = aId;
      } else {
        const hPens = randRange(3, 5);
        const aPens = hPens === 5 ? randRange(2, 4) : 5;
        node.homePens = hPens;
        node.awayPens = aPens;
        node.winnerClubId = hPens > aPens ? hId : aId;
      }
    });

  // Check if round is complete and advance bracket
  const roundDone = updatedBracket.filter(n => n.round === currentCupRound).every(n => n.isCompleted);
  if (!roundDone) {
    return { updatedBracket, nextCupRound: currentCupRound, cupFinished: false };
  }

  if (currentCupRound === 'F') {
    const finalist = updatedBracket.find(b => b.id === 'F-1');
    return { updatedBracket, nextCupRound: 'FINISHED', cupFinished: true, cupWinnerId: finalist?.winnerClubId };
  }

  const progressions: Record<string, { next: string; slots: number }> = {
    R16: { next: 'QF', slots: 4 },
    QF: { next: 'SF', slots: 2 },
    SF: { next: 'F',  slots: 1 },
  };
  const prog = progressions[currentCupRound];
  if (prog) {
    const winners = updatedBracket.filter(b => b.round === currentCupRound).map(b => b.winnerClubId || '');
    for (let i = 0; i < prog.slots; i++) {
      const node = updatedBracket.find(b => b.id === `${prog.next}-${i + 1}`);
      if (node) {
        node.homeClubId = winners[i * 2] || undefined;
        node.awayClubId = winners[i * 2 + 1] || undefined;
      }
    }
    return { updatedBracket, nextCupRound: prog.next, cupFinished: false };
  }

  return { updatedBracket, nextCupRound: currentCupRound, cupFinished: false };
}
