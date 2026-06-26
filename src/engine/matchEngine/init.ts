import type { Club, LiveMatchSimulation } from '../../types';

export function initLiveMatch(
  fixtureId: string,
  homeClub: Club,
  awayClub: Club,
): LiveMatchSimulation {
  return {
    fixtureId,
    homeClubId: homeClub.id,
    awayClubId: awayClub.id,
    homeScore: 0,
    awayScore: 0,
    tick: 0,
    isFinished: false,
    possession: Math.random() > 0.5 ? 'home' : 'away',
    ballX: 50,
    ballY: 50,
    zone: 'MID',
    events: [
      {
        tick: 0,
        minute: 0,
        type: 'info',
        description: `Referee blows the whistle! Kickoff under the floodlights. ${homeClub.name} vs ${awayClub.name} has begun!`,
      },
    ],
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
  };
}

// Swaps out fatigued starters for fresh bench players at half-time.
export function runAssistantSubstitution(club: Club): void {
  const lowStaminaStarters = club.squad
    .filter((p) => p.isStarting && p.stamina < 65)
    .sort((a, b) => a.stamina - b.stamina);

  if (lowStaminaStarters.length === 0) return;

  const benchPlayers = club.squad.filter((p) => !p.isStarting && p.stamina >= 80);
  if (benchPlayers.length === 0) return;

  const subsCount = Math.min(2, lowStaminaStarters.length, benchPlayers.length);

  for (let i = 0; i < subsCount; i++) {
    const starter = lowStaminaStarters[i];
    const sub =
      benchPlayers.find((b) => b.position === starter.position && !b.isStarting) ||
      benchPlayers.find((b) => !b.isStarting);

    if (sub) {
      starter.isStarting = false;
      sub.isStarting = true;
    }
  }
}
