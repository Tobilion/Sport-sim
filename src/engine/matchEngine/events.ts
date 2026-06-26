import type { Club, LiveMatchSimulation, MatchEvent, Player } from '../../types';
import { randRange } from '../../data/names';
import {
  GOAL_CELEBRATIONS, SHOT_SAVES, SHOT_MISSES, FOULS_AND_CARDS,
} from './commentary';
import { getStartingByPos, getGK } from './physics';

export interface AttackResult {
  eventType: MatchEvent['type'];
  commentaryText: string;
  eventPlayerName: string;
  newZone: LiveMatchSimulation['zone'];
  newBallX: number;
  newBallY: number;
}

export interface FoulResult {
  eventType: MatchEvent['type'];
  commentaryText: string;
  eventPlayerName: string;
  newZone: LiveMatchSimulation['zone'];
  newBallX: number;
  newBallY: number;
}

// Resolves a shot attempt in the attacking zone.
export function resolveAttack(
  sim: LiveMatchSimulation,
  currentTeam: Club,
  opposingTeam: Club,
  isHomePossession: boolean,
  homeSetPieceBonus: number,
  awaySetPieceBonus: number,
  homeGKBonus: number,
  awayGKBonus: number,
  homeDefBonus: number,
  awayDefBonus: number,
): AttackResult {
  const atts = getStartingByPos(currentTeam, 'ATT').concat(getStartingByPos(currentTeam, 'MID'));
  const shooter = atts.length ? atts[randRange(0, atts.length - 1)] : currentTeam.squad[randRange(0, 3)];
  const isCup = sim.fixtureId.startsWith('cup-');

  if (isHomePossession) sim.homeShots++;
  else sim.awayShots++;

  let threshold = 46 + (shooter.rating - 75);

  const cPlaystyle = isHomePossession ? sim.userPlaystyle ?? currentTeam.playstyle : sim.userPlaystyle ?? opposingTeam.playstyle;
  if (cPlaystyle === 'Attacking') threshold += 8;
  if (cPlaystyle === 'Defending') threshold -= 5;
  if (currentTeam.mentality === 'Tiki-Taka') threshold += 12;
  if (opposingTeam.mentality === 'Park the Bus') threshold -= 18;
  if (currentTeam.mentality === 'Counter-Attack' && sim.tick % 4 === 0) threshold += 16;

  const activeSetPieceBonus = isHomePossession ? homeSetPieceBonus : awaySetPieceBonus;
  if (sim.tick % 5 === 0) threshold += 4 + activeSetPieceBonus * 1.5;

  if (sim.weather === 'Heavy Rain') threshold -= 8;
  if (sim.weather === 'Snow') threshold -= 12;
  if (sim.weather === 'Extreme Heat') threshold -= 4;

  if (sim.tick + 1 >= 24) {
    const isTrailing = isHomePossession ? sim.homeScore < sim.awayScore : sim.awayScore < sim.homeScore;
    if (isTrailing) threshold += 8;
  }

  const oppGK = getGK(opposingTeam);
  const opposingGKBonus = isHomePossession ? awayGKBonus : homeGKBonus;
  threshold -= (oppGK.rating - 75) + (isHomePossession ? awayDefBonus : homeDefBonus) + (opposingGKBonus * 1.2);

  const shotRoll = randRange(1, 100);

  if (shotRoll <= Math.max(12, threshold)) {
    return resolveGoal(sim, shooter, currentTeam, isHomePossession, isCup);
  }

  if (shotRoll <= Math.max(28, threshold + 32)) {
    return resolveSaveOrError(sim, shooter, oppGK, currentTeam, isHomePossession, isCup);
  }

  // Miss
  const text = SHOT_MISSES[randRange(0, SHOT_MISSES.length - 1)].replace('{shooter}', shooter.name);
  return { eventType: 'shot_miss', commentaryText: text, eventPlayerName: shooter.name, newZone: 'DEF', newBallX: isHomePossession ? 15 : 85, newBallY: 50 };
}

function resolveGoal(
  sim: LiveMatchSimulation,
  shooter: Player,
  currentTeam: Club,
  isHomePossession: boolean,
  isCup: boolean,
): AttackResult {
  if (isHomePossession) { sim.homeScore++; sim.homeShooters.push(shooter.name); sim.homeShotsOnTarget++; }
  else { sim.awayScore++; sim.awayShooters.push(shooter.name); sim.awayShotsOnTarget++; }

  if (isCup) shooter.tournamentGoals = (shooter.tournamentGoals || 0) + 1;
  else shooter.goals++;
  shooter.morale = Math.min(100, shooter.morale + 10);

  const midfielders = getStartingByPos(currentTeam, 'MID');
  let text: string;
  if (midfielders.length) {
    const assister = midfielders[randRange(0, midfielders.length - 1)];
    if (isCup) assister.tournamentAssists = (assister.tournamentAssists || 0) + 1;
    else assister.assists++;
    assister.morale = Math.min(100, assister.morale + 5);
    text = GOAL_CELEBRATIONS[randRange(0, GOAL_CELEBRATIONS.length - 1)]
      .replace('{shooter}', shooter.name).replace('{passer}', assister.name);
  } else {
    text = `GOAL! ${shooter.name} makes a beautiful solo run and places it beautifully home!`;
  }

  return { eventType: 'goal', commentaryText: text, eventPlayerName: shooter.name, newZone: 'MID', newBallX: 50, newBallY: 50 };
}

function resolveSaveOrError(
  sim: LiveMatchSimulation,
  shooter: Player,
  oppGK: Player,
  currentTeam: Club,
  isHomePossession: boolean,
  isCup: boolean,
): AttackResult {
  const gkErrorChance = oppGK.stamina < 40 ? 6 : 3;
  if (randRange(1, 100) <= gkErrorChance) {
    // GK error — goal
    if (isHomePossession) { sim.homeScore++; sim.homeShooters.push(shooter.name); sim.homeShotsOnTarget++; }
    else { sim.awayScore++; sim.awayShooters.push(shooter.name); sim.awayShotsOnTarget++; }
    if (isCup) shooter.tournamentGoals = (shooter.tournamentGoals || 0) + 1;
    else shooter.goals++;
    shooter.morale = Math.min(100, shooter.morale + 10);
    oppGK.morale = Math.max(0, oppGK.morale - 20);
    return { eventType: 'goal', commentaryText: `GOAL! Goalkeeper error! ${oppGK.name} fumbles a routine save and ${shooter.name} pounces!`, eventPlayerName: shooter.name, newZone: 'MID', newBallX: 50, newBallY: 50 };
  }

  // Save
  if (isHomePossession) sim.homeShotsOnTarget++;
  else sim.awayShotsOnTarget++;
  if (isCup) oppGK.tournamentSaves = (oppGK.tournamentSaves || 0) + 1;
  else oppGK.saves = (oppGK.saves || 0) + 1;
  oppGK.morale = Math.min(100, oppGK.morale + 5);
  const text = SHOT_SAVES[randRange(0, SHOT_SAVES.length - 1)].replace('{keeper}', oppGK.name).replace('{shooter}', shooter.name);
  return { eventType: 'shot_saved', commentaryText: text, eventPlayerName: shooter.name, newZone: 'ATT', newBallX: isHomePossession ? 95 : 5, newBallY: Math.random() > 0.5 ? 90 : 10 };
}

// Resolves a foul/card when possession is turned over.
export function resolveFoul(
  sim: LiveMatchSimulation,
  opposingTeam: Club,
  currentTeam: Club,
  isHomePossession: boolean,
): FoulResult | null {
  let foulChance = 11;
  if (opposingTeam.mentality === 'Gegenpressing') foulChance += 8;
  if (sim.weather === 'Heavy Rain') foulChance += 4;
  if (sim.weather === 'Extreme Heat') foulChance += 3;
  if (sim.weather === 'Snow') foulChance += 2;

  if (randRange(1, 100) > foulChance) return null;

  const defs = getStartingByPos(opposingTeam, 'DEF');
  const defender = defs.length ? defs[randRange(0, defs.length - 1)] : opposingTeam.squad[randRange(1, 4)];
  const isCup = sim.fixtureId.startsWith('cup-');

  if (!isHomePossession) sim.homeConcededFouls++;
  else sim.awayConcededFouls++;

  let text = FOULS_AND_CARDS[randRange(0, FOULS_AND_CARDS.length - 1)].replace('{player}', defender.name);
  let eventType: MatchEvent['type'] = 'foul';
  const cardRoll = randRange(1, 100);

  if (cardRoll <= 16) {
    eventType = 'yellow_card';
    if (isCup) defender.tournamentYellowCards = (defender.tournamentYellowCards || 0) + 1;
    else defender.yellowCards++;
    text += ` The referee delivers a YELLOW CARD to ${defender.name}.`;
    const yellows = isCup ? (defender.tournamentYellowCards || 0) : defender.yellowCards;
    if (yellows >= 2) {
      eventType = 'red_card';
      if (isCup) defender.tournamentRedCards = (defender.tournamentRedCards || 0) + 1;
      else defender.redCards++;
      defender.morale = Math.max(20, defender.morale - 30);
      text += ` SECOND yellow — RED CARD! ${defender.name} walks off.`;
    }
  } else if (cardRoll === 100) {
    eventType = 'red_card';
    if (isCup) defender.tournamentRedCards = (defender.tournamentRedCards || 0) + 1;
    else defender.redCards++;
    defender.morale = Math.max(10, defender.morale - 40);
    text = `RED CARD! ${defender.name} lunges in dangerously. The referee instantly pulls out the red!`;
  }

  const newZone: LiveMatchSimulation['zone'] = sim.zone === 'ATT' ? 'DEF' : sim.zone === 'DEF' ? 'ATT' : 'MID';
  return { eventType, commentaryText: text, eventPlayerName: defender.name, newZone, newBallX: isHomePossession ? randRange(25, 45) : randRange(55, 75), newBallY: randRange(20, 80) };
}
