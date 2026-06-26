import type { Club, Fixture, LiveMatchSimulation, MatchEvent } from '../../types';
import { randRange } from '../../data/names';
import { DEF_TO_MID_PASSES, MID_TO_MID_PASSES, ATTACKING_PLAYS } from './commentary';
import { initLiveMatch, runAssistantSubstitution } from './init';
import {
  calcCoachBonuses, resolvePossession, applyStaminaDecay, getStartingByPos,
} from './physics';
import { resolveAttack, resolveFoul } from './events';

export function simulateTick(
  sim: LiveMatchSimulation,
  homeClub: Club,
  awayClub: Club,
): LiveMatchSimulation {
  if (sim.isFinished) return sim;

  const nextTick = sim.tick + 1;
  const minute = Math.min(90, Math.floor((nextTick / 30) * 90));
  const newEvents: MatchEvent[] = [];

  const homeBonuses = calcCoachBonuses(homeClub);
  const awayBonuses = calcCoachBonuses(awayClub);

  const currentPossession = resolvePossession(
    sim, homeClub, awayClub, homeBonuses.passBonus, awayBonuses.passBonus,
  );

  const isHomePossession = currentPossession === 'home';
  const currentTeam = isHomePossession ? homeClub : awayClub;
  const opposingTeam = isHomePossession ? awayClub : homeClub;

  let currentZone = sim.zone;
  let ballX = sim.ballX;
  let ballY = sim.ballY;
  let commentaryText = '';
  let eventType: MatchEvent['type'] = 'info';
  let eventPlayerName = '';

  if (currentPossession === sim.possession) {
    // Continuing possession — zone progression
    const transitionChance = randRange(1, 100);

    if (sim.zone === 'DEF') {
      if (transitionChance > 25) {
        currentZone = 'MID';
        ballX = randRange(42, 58);
        ballY = randRange(15, 85);
        const mids = getStartingByPos(currentTeam, 'MID');
        const passer = mids.length ? mids[randRange(0, mids.length - 1)].name : 'Midfielder';
        commentaryText = DEF_TO_MID_PASSES[randRange(0, DEF_TO_MID_PASSES.length - 1)].replace('{passer}', passer);
      } else {
        ballX = isHomePossession ? randRange(15, 30) : randRange(70, 85);
        commentaryText = `Possession restarts deep as ${currentTeam.name} circulate across their defensive lines.`;
      }
    } else if (sim.zone === 'MID') {
      if (transitionChance > 32) {
        currentZone = 'ATT';
        ballX = isHomePossession ? randRange(75, 95) : randRange(5, 25);
        ballY = randRange(10, 90);
        const mids = getStartingByPos(currentTeam, 'MID');
        const passer = mids.length ? mids[randRange(0, mids.length - 1)].name : 'Midfielder';
        commentaryText = ATTACKING_PLAYS[randRange(0, ATTACKING_PLAYS.length - 1)].replace('{passer}', passer);
      } else {
        ballX = randRange(40, 60);
        ballY = randRange(20, 80);
        const mids = getStartingByPos(currentTeam, 'MID');
        const passer = mids.length ? mids[randRange(0, mids.length - 1)].name : 'Midfielder';
        commentaryText = MID_TO_MID_PASSES[randRange(0, MID_TO_MID_PASSES.length - 1)].replace('{passer}', passer);
      }
    } else {
      // Attacking zone — resolve shot
      const result = resolveAttack(
        sim, currentTeam, opposingTeam, isHomePossession,
        homeBonuses.setPieceBonus, awayBonuses.setPieceBonus,
        homeBonuses.gkBonus, awayBonuses.gkBonus,
        homeBonuses.defBonus, awayBonuses.defBonus,
      );
      eventType = result.eventType;
      commentaryText = result.commentaryText;
      eventPlayerName = result.eventPlayerName;
      currentZone = result.newZone;
      ballX = result.newBallX;
      ballY = result.newBallY;
    }
  } else {
    // Turnover
    const foulResult = resolveFoul(sim, opposingTeam, currentTeam, isHomePossession);
    if (foulResult) {
      eventType = foulResult.eventType;
      commentaryText = foulResult.commentaryText;
      eventPlayerName = foulResult.eventPlayerName;
      currentZone = foulResult.newZone;
      ballX = foulResult.newBallX;
      ballY = foulResult.newBallY;
    } else {
      const defs = getStartingByPos(opposingTeam, 'DEF');
      const defender = defs.length ? defs[randRange(0, defs.length - 1)] : opposingTeam.squad[1];
      commentaryText = `Interception! ${defender.name} reads the play perfectly, breaking down ${currentTeam.name}'s build-up.`;
      currentZone = sim.zone === 'ATT' ? 'DEF' : sim.zone === 'DEF' ? 'ATT' : 'MID';
      ballX = isHomePossession ? randRange(25, 45) : randRange(55, 75);
      ballY = randRange(20, 80);
    }
  }

  // Half-time and full-time override
  if (nextTick === 15) {
    currentZone = 'MID'; ballX = 50; ballY = 50;
    newEvents.push({ tick: nextTick, minute: 45, type: 'half_time', description: `HT: Half-Time! Score: ${homeClub.name} ${sim.homeScore} - ${sim.awayScore} ${awayClub.name}.` });
  } else if (nextTick === 30) {
    currentZone = 'MID'; ballX = 50; ballY = 50;
    sim.isFinished = true;
    newEvents.push({ tick: nextTick, minute: 90, type: 'full_time', description: `FT: MATCH ENDED! Final Score: ${homeClub.name} ${sim.homeScore} - ${sim.awayScore} ${awayClub.name}` });
  } else if (commentaryText) {
    newEvents.push({ tick: nextTick, minute, type: eventType, playerName: eventPlayerName, description: commentaryText });
  }

  if (currentPossession === 'home') sim.homePossessionScore += 2;
  else sim.awayPossessionScore += 2;

  applyStaminaDecay(homeClub);
  applyStaminaDecay(awayClub);

  return {
    ...sim,
    tick: nextTick,
    possession: currentPossession,
    zone: currentZone,
    ballX: Number(ballX.toFixed(1)),
    ballY: Number(ballY.toFixed(1)),
    events: [...sim.events, ...newEvents],
  };
}

export function simulateEntireMatch(fixtureId: string, homeClub: Club, awayClub: Club): Fixture {
  let sim = initLiveMatch(fixtureId, homeClub, awayClub);

  while (!sim.isFinished) {
    if (sim.tick === 14) {
      runAssistantSubstitution(homeClub);
      runAssistantSubstitution(awayClub);
    }
    sim = simulateTick(sim, homeClub, awayClub);
  }

  const totalPoss = sim.homePossessionScore + sim.awayPossessionScore;
  const homePct = Math.round((sim.homePossessionScore / totalPoss) * 100);

  const goalDiff = sim.homeScore - sim.awayScore;
  homeClub.squad.forEach((p) => {
    if (p.isStarting) {
      const r = randRange(62, 81) / 10 + goalDiff * 0.35 + p.goals * 1.6 + p.assists * 1.1;
      p.matchRatings = [...p.matchRatings, Number(Math.min(10, Math.max(3.2, p.redCards > 0 ? Math.max(3.0, r - 3.8) : r)).toFixed(1))];
    }
  });
  awayClub.squad.forEach((p) => {
    if (p.isStarting) {
      const r = randRange(62, 81) / 10 - goalDiff * 0.35 + p.goals * 1.6 + p.assists * 1.1;
      p.matchRatings = [...p.matchRatings, Number(Math.min(10, Math.max(3.2, p.redCards > 0 ? Math.max(3.0, r - 3.8) : r)).toFixed(1))];
    }
  });

  return {
    id: fixtureId,
    week: 1,
    homeClubId: homeClub.id,
    awayClubId: awayClub.id,
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
    isCompleted: true,
    homeGoalsDetail: sim.homeShooters,
    awayGoalsDetail: sim.awayShooters,
    homePossession: homePct,
    awayPossession: 100 - homePct,
    homeShots: sim.homeShots,
    awayShots: sim.awayShots,
    homeShotsOnTarget: sim.homeShotsOnTarget,
    awayShotsOnTarget: sim.awayShotsOnTarget,
  };
}

export function quickSimulateFixture(homeClub: Club, awayClub: Club, fixtureId = 'dummy-id'): Fixture {
  return simulateEntireMatch(fixtureId, homeClub, awayClub);
}
