/**
 * weeklyDevelopment.ts
 * Processes end-of-week player development, fatigue recovery, injuries, morale shifts,
 * coach specialty multipliers, and age-based decline.
 */

import { Club, Player, Coach } from '../types';
import { randRange } from '../data/names';

// ── Constants ────────────────────────────────────────────────────────────────
const PEAK_AGE_FLOOR = 27;     // After this age: start decline phase
const PRIME_AGE_WINDOW = 24;   // Under this: faster growth
const MAX_STAT_CAP = 99;

// Coach specialty → which player attribute category benefits most
const SPECIALTY_STAT_BONUS: Record<string, string[]> = {
  'Attacking Coach':               ['shooting', 'dribbling', 'pace'],
  'Defending Coach':               ['defending', 'physical'],
  'Goalkeeping Coach':             ['pace', 'physical', 'passing'],  // GK: reflexes mapped to pace
  'Fitness & Conditioning Coach':  ['physical', 'pace'],
  'Set Pieces Coach':              ['shooting', 'passing'],
  'Youth Development Coach':       ['all'],
  'Head Coach (Tactics)':          ['passing', 'dribbling'],
  'Assistant Manager':             ['all'],
  'Pressing & Transition Coach':   ['pace', 'physical', 'defending'],
  'Psychological Coach':           [],  // morale only
  'Data Analyst':                  ['all'],
  // Legacy
  'Attacking':                     ['shooting', 'dribbling'],
  'Defending':                     ['defending', 'physical'],
  'Goalkeeping':                   ['pace', 'physical'],
  'Fitness':                       ['physical', 'pace'],
  'Tactics':                       ['passing', 'dribbling'],
  'Youth':                         ['all'],
  'Set Pieces':                    ['shooting', 'passing'],
  'Corners':                       ['shooting', 'passing'],
  'Development':                   ['all'],
};

interface DevelopmentResult {
  updatedClub: Club;
  events: DevelopmentEvent[];
}

interface DevelopmentEvent {
  type: 'growth' | 'injury' | 'recovery' | 'retirement' | 'potential_unlock' | 'morale';
  playerId: string;
  playerName: string;
  message: string;
  data?: Record<string, number | string>;
}

// ── Main weekly processor ─────────────────────────────────────────────────────
export function processWeeklyDevelopment(
  club: Club,
  currentWeek: number,
  isUserClub = false,
): DevelopmentResult {
  const events: DevelopmentEvent[] = [];
  const allCoaches: Coach[] = [club.coach, ...(club.coaches || [])].filter(Boolean);

  // Build map: coachId → Coach object
  const coachById = new Map<string, Coach>(allCoaches.map(c => [c.id, c]));

  // Build map: playerId → assigned coach
  const playerCoachMap = new Map<string, Coach>();
  [...(club.squad || []), ...(club.youthSquad || [])].forEach(p => {
    if (p.focusedCoachId) {
      const coach = coachById.get(p.focusedCoachId);
      if (coach) playerCoachMap.set(p.id, coach);
    }
  });

  // Training quality from facilities (1-5 scale)
  const facilityBonus = (club.trainingFacilities - 1) * 0.4;

  const processPlayer = (p: Player, isYouth: boolean): Player => {
    let updated = { ...p };

    // ── 1. Fatigue recovery (between matches) ──────────────────────────────
    const medRecovery = (club.medicalFacilities - 1) * 0.5;
    updated.fatigue = Math.min(100, (updated.fatigue ?? 70) + 8 + medRecovery);

    // ── 2. Injury recovery ────────────────────────────────────────────────
    if (updated.injuryWeeksRemaining && updated.injuryWeeksRemaining > 0) {
      updated.injuryWeeksRemaining -= 1;
      if (updated.injuryWeeksRemaining === 0) {
        updated.injuryType = undefined;
        updated.stamina = Math.max(60, updated.stamina);
        events.push({
          type: 'recovery',
          playerId: updated.id,
          playerName: updated.name,
          message: `${updated.name} has returned from injury and is available for selection.`,
        });
      }
      return updated; // No development while injured
    }

    // ── 3. Injury roll (higher risk if low fatigue) ───────────────────────
    const fatiguePenalty = updated.fatigue !== undefined ? Math.max(0, (50 - updated.fatigue) * 0.6) : 0;
    const injuryBaseChance = isYouth ? 5 : 8;
    const injuryRoll = randRange(1, 100);
    if (injuryRoll <= injuryBaseChance + fatiguePenalty) {
      const injuryTypes = ['Muscle Strain', 'Knee Sprain', 'Hamstring Pull', 'Ankle Twist', 'Back Spasm', 'Shin Splints'];
      const duration = randRange(1, 4);
      updated.injuryWeeksRemaining = duration;
      updated.injuryType = injuryTypes[randRange(0, injuryTypes.length - 1)];
      updated.stamina = Math.max(20, updated.stamina - 20);
      updated.morale = Math.max(30, updated.morale - 10);
      events.push({
        type: 'injury',
        playerId: updated.id,
        playerName: updated.name,
        message: `${updated.name} suffered a ${updated.injuryType}! Expected out for ${duration} week${duration > 1 ? 's' : ''}.`,
        data: { duration, injuryType: updated.injuryType },
      });
      return updated;
    }

    // ── 4. Age-based growth calculation ───────────────────────────────────
    const age = updated.age;
    let growthMultiplier: number;
    if (age < 18) growthMultiplier = 2.2;
    else if (age < PRIME_AGE_WINDOW) growthMultiplier = 1.6;
    else if (age < PEAK_AGE_FLOOR) growthMultiplier = 0.7;
    else if (age < 31) growthMultiplier = -0.2; // slight decline starts
    else if (age < 34) growthMultiplier = -0.6;
    else growthMultiplier = -1.0;              // clear decline

    // ── 5. Coach specialty multiplier ─────────────────────────────────────
    let coachMultiplier = 1.0;
    let focusedStats: string[] = [];
    const assignedCoach = playerCoachMap.get(updated.id);
    if (assignedCoach) {
      const coachRatingBonus = (assignedCoach.rating - 50) / 100; // 0 to 0.5
      coachMultiplier = 1.5 + coachRatingBonus; // 50% focused coaching bonus
      focusedStats = SPECIALTY_STAT_BONUS[assignedCoach.specialty] || [];
    }

    // ── 6. Potential cap check — only grow toward potential ────────────────
    const potentialRating = updated.potentialRating ?? Math.min(99, updated.rating + 5);
    const distanceToPotential = potentialRating - updated.rating;
    if (distanceToPotential <= 0 && growthMultiplier > 0) {
      // At potential — only small fluctuations
      growthMultiplier *= 0.1;
    }

    // ── 7. Apply attribute changes ─────────────────────────────────────────
    const baseGrowthChance = facilityBonus + 0.4; // per attribute
    const logChanges: Record<string, number> = {};

    if (!updated.attributes) {
      // Shouldn't happen but guard anyway
      return updated;
    }

    const attrs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'] as const;
    const newAttrs = { ...updated.attributes };

    attrs.forEach(attr => {
      const roll = Math.random();
      const isFocused = focusedStats.includes(attr) || focusedStats.includes('all');
      const threshold = baseGrowthChance + (isFocused ? 0.25 : 0) + (isYouth ? 0.1 : 0);

      if (roll < threshold) {
        const rawDelta = growthMultiplier * coachMultiplier * (Math.random() * 1.5 + 0.5);
        const delta = Math.round(rawDelta);
        if (delta !== 0) {
          const capped = Math.min(MAX_STAT_CAP, Math.max(30, newAttrs[attr] + delta));
          const actual = capped - newAttrs[attr];
          if (actual !== 0) {
            newAttrs[attr] = capped;
            logChanges[attr] = actual;
          }
        }
      }
    });

    updated.attributes = newAttrs;

    // ── 8. Overall rating derived from attributes ──────────────────────────
    const attrAvg = Math.round(
      (newAttrs.pace + newAttrs.shooting + newAttrs.passing + newAttrs.dribbling + newAttrs.defending + newAttrs.physical) / 6
    );
    const ratingDelta = attrAvg - updated.rating;

    // Rating moves at 30% of attribute average change to feel gradual
    if (ratingDelta !== 0) {
      const ratingChange = Math.round(ratingDelta * 0.3);
      if (ratingChange !== 0) {
        const newRating = Math.min(99, Math.max(30, updated.rating + ratingChange));
        if (newRating !== updated.rating) {
          logChanges['OVR'] = newRating - updated.rating;
          updated.rating = newRating;
        }
      }
    }

    // ── 9. Potential grows slightly for young players who consistently develop
    if (isYouth || age < 21) {
      const potGrowth = Math.random() < 0.12 ? randRange(1, 2) : 0;
      if (potGrowth > 0 && potentialRating < 95) {
        updated.potentialRating = Math.min(99, potentialRating + potGrowth);
        logChanges['POT'] = potGrowth;
        events.push({
          type: 'potential_unlock',
          playerId: updated.id,
          playerName: updated.name,
          message: `${updated.name}'s potential ceiling increased to ${updated.potentialRating}! Scouts are taking notice.`,
        });
      }
    }

    // ── 10. Log changes to development history ─────────────────────────────
    if (Object.keys(logChanges).length > 0) {
      const devLog = updated.developmentLog ?? [];
      devLog.push({ week: currentWeek, changes: logChanges });
      updated.developmentLog = devLog.slice(-20); // keep last 20 entries

      if (isUserClub && Object.keys(logChanges).some(k => k === 'OVR' && logChanges[k] > 0)) {
        events.push({
          type: 'growth',
          playerId: updated.id,
          playerName: updated.name,
          message: `${updated.name} improved this week! (OVR +${logChanges['OVR']})${assignedCoach ? ` — ${assignedCoach.name}'s coaching is paying off.` : ''}`,
          data: logChanges,
        });
      }
    }

    // ── 11. Morale recovery ───────────────────────────────────────────────
    const moraleRecovery = assignedCoach?.specialty === 'Psychological Coach' ? 8 : 3;
    updated.morale = Math.min(100, updated.morale + moraleRecovery);

    // ── 12. Stamina partial recovery ──────────────────────────────────────
    const staminaRecovery = 15 + medRecovery * 2;
    updated.stamina = Math.min(100, updated.stamina + staminaRecovery);

    // ── 13. Training progress XP ──────────────────────────────────────────
    const xpGain = Math.round(4 + (assignedCoach ? 8 : 0) + facilityBonus * 3);
    updated.trainingProgress = Math.min(100, (updated.trainingProgress ?? 0) + xpGain);

    // ── 14. Retirement check ──────────────────────────────────────────────
    if (age >= 38 && Math.random() < 0.3) {
      events.push({
        type: 'retirement',
        playerId: updated.id,
        playerName: updated.name,
        message: `${updated.name} has announced their retirement from professional football after a distinguished career!`,
      });
    }

    return updated;
  };

  // Process all players
  const updatedSquad = (club.squad || []).map(p => processPlayer(p, false));
  const updatedYouth = (club.youthSquad || []).map(p => processPlayer(p, true));

  const updatedClub: Club = {
    ...club,
    squad: updatedSquad,
    youthSquad: updatedYouth,
  };

  return { updatedClub, events };
}

// ── Age all players at season end ────────────────────────────────────────────
export function ageAllPlayers(clubs: Club[]): Club[] {
  return clubs.map(club => ({
    ...club,
    squad: club.squad.map(p => ({ ...p, age: p.age + 1 })),
    youthSquad: (club.youthSquad || []).map(p => ({ ...p, age: p.age + 1 })),
  }));
}

// ── Graduate youth players who've reached 18 into first team ─────────────────
export function processYouthGraduation(club: Club): { club: Club; graduates: Player[] } {
  const graduates: Player[] = [];
  const remaining: Player[] = [];

  (club.youthSquad || []).forEach(p => {
    if (p.age >= 18 && club.squad.length < 30) {
      graduates.push({ ...p, isYouth: false, isStarting: false });
    } else {
      remaining.push(p);
    }
  });

  return {
    club: {
      ...club,
      squad: [...club.squad, ...graduates],
      youthSquad: remaining,
    },
    graduates,
  };
}
