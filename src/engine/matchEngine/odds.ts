import type { Club, LiveOdds } from '../../types';

export function calculatePreMatchOdds(homeClub: Club, awayClub: Club): LiveOdds {
  const homePower = homeClub.squad.reduce((s, p) => s + p.rating, 0) / homeClub.squad.length;
  const awayPower = awayClub.squad.reduce((s, p) => s + p.rating, 0) / awayClub.squad.length;
  const diff = homePower - awayPower;

  return {
    homeWin: parseFloat(Math.min(15.0, Math.max(1.05, 2.2 - diff * 0.15)).toFixed(2)),
    draw: parseFloat(Math.min(6.5, Math.max(2.1, 3.2 - Math.abs(diff) * 0.05)).toFixed(2)),
    awayWin: parseFloat(Math.min(15.0, Math.max(1.05, 2.6 + diff * 0.15)).toFixed(2)),
    over25: parseFloat(Math.min(3.5, Math.max(1.3, 1.85 - diff * 0.02)).toFixed(2)),
    under25: parseFloat(Math.min(3.5, Math.max(1.3, 1.9 + diff * 0.02)).toFixed(2)),
  };
}
