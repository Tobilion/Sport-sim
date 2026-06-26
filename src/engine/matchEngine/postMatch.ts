import type { Club, LiveMatchSimulation, PostMatchAnalysis } from '../../types';
import { randRange } from '../../data/names';
import { GOAL_REPLAY_TEMPLATES, HIGHLIGHTS_OPENERS, HIGHLIGHTS_MIDDLES, HIGHLIGHTS_CLOSERS, pick } from './commentary';

export function generatePostMatchAnalysis(
  sim: LiveMatchSimulation,
  homeClub: Club,
  awayClub: Club,
): PostMatchAnalysis {
  const playerRatings: Record<string, number> = {};

  const calcRating = (
    p: { goals: number; assists: number; saves?: number; yellowCards: number; redCards: number },
    isHome: boolean,
  ): number => {
    const diff = isHome ? sim.homeScore - sim.awayScore : sim.awayScore - sim.homeScore;
    let r = 6.0 + diff * 0.3 + p.goals * 1.5 + p.assists * 0.8
      + (p.saves || 0) * 0.25 - p.yellowCards * 0.5 - p.redCards * 2.0;
    r += (Math.random() - 0.5) * 1.0;
    return parseFloat(Math.min(10, Math.max(1, r)).toFixed(1));
  };

  homeClub.squad.forEach((p) => { if (p.isStarting) playerRatings[p.id] = calcRating(p, true); });
  awayClub.squad.forEach((p) => { if (p.isStarting) playerRatings[p.id] = calcRating(p, false); });

  // MOTM: highest-rated player from the winning team (or home team on draw)
  let motmId = '';
  let motmRating = -1;
  const checkTeam = sim.homeScore !== sim.awayScore
    ? (sim.homeScore > sim.awayScore ? homeClub : awayClub)
    : homeClub;

  [...checkTeam.squad, ...awayClub.squad].forEach((p) => {
    if (p.isStarting && (playerRatings[p.id] || 0) > motmRating) {
      motmRating = playerRatings[p.id] || 0;
      motmId = p.id;
    }
  });

  // Goal replays
  let replayMinute = 5;
  const goalReplays = sim.events
    .filter((ev) => ev.type === 'goal')
    .map((ev) => {
      const minute = ev.minute || replayMinute;
      replayMinute = minute + 3;
      const scorer = ev.playerName || 'Unknown';
      return {
        minute,
        scorer,
        description: pick(GOAL_REPLAY_TEMPLATES).replace('{scorer}', scorer),
      };
    });

  const highlightsText = [
    pick(HIGHLIGHTS_OPENERS),
    pick(HIGHLIGHTS_MIDDLES).replace('{homeTeam}', homeClub.name).replace('{awayTeam}', awayClub.name),
    pick(HIGHLIGHTS_CLOSERS),
  ].join(' ');

  const totalPoss = (sim.homePossessionScore + sim.awayPossessionScore) || 1;
  const cardTypes = new Set(['foul', 'yellow_card', 'red_card']);
  const homeFouls = sim.events.filter((e) => e.teamId === homeClub.id && cardTypes.has(e.type)).length;
  const awayFouls = sim.events.filter((e) => e.teamId === awayClub.id && cardTypes.has(e.type)).length;

  return {
    fixtureId: sim.fixtureId,
    homeClubId: sim.homeClubId,
    awayClubId: sim.awayClubId,
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
    playerRatings,
    motm: motmId,
    homeShots: sim.homeShots,
    awayShots: sim.awayShots,
    homeShotsOnTarget: sim.homeShotsOnTarget,
    awayShotsOnTarget: sim.awayShotsOnTarget,
    homePossession: Math.round((sim.homePossessionScore / totalPoss) * 100),
    awayPossession: Math.round((sim.awayPossessionScore / totalPoss) * 100),
    homeFouls,
    awayFouls,
    highlightsText,
    goalReplays,
  };
}
