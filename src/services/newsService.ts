import type { Club, NewsItem } from '../types';

function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let _counter = 0;
function mkId(week: number): string {
  return `news-${week}-${Date.now()}-${++_counter}`;
}

/** Generate procedural news items for a given week advance. */
export function generateWeeklyNews(
  clubs: Club[],
  currentWeek: number,
  userClubId: string,
): NewsItem[] {
  const items: NewsItem[] = [];
  const sorted = [...clubs].sort((a, b) =>
    (b.won * 3 + b.drawn) - (a.won * 3 + a.drawn)
  );

  // Form headlines from each club's streak
  clubs.forEach(club => {
    if (Math.random() > 0.82) {
      const recent = club.streak.slice(-3).join('');
      const last = club.streak[club.streak.length - 1];
      if (recent === 'WWW') {
        items.push({ id: mkId(currentWeek), week: currentWeek, type: 'match',
          headline: `🔥 ${club.name} On Fire — Three Consecutive Wins Has Fans Dreaming Of Glory!` });
      } else if (recent === 'LLL') {
        items.push({ id: mkId(currentWeek), week: currentWeek, type: 'general',
          headline: `⚠️ Crisis at ${club.name} — Three Straight Defeats Piles Pressure On The Dugout` });
      } else if (last === 'W') {
        items.push({ id: mkId(currentWeek), week: currentWeek, type: 'match',
          headline: `✅ ${club.name} Pick Up Vital Three Points In Tense Encounter` });
      } else if (last === 'L') {
        items.push({ id: mkId(currentWeek), week: currentWeek, type: 'general',
          headline: `📉 ${club.name} Suffer Defeat — Questions Being Asked In The Boardroom` });
      }
    }
  });

  // League table story
  if (Math.random() > 0.65 && sorted.length >= 2) {
    const leader = sorted[0];
    const second = sorted[1];
    items.push({ id: mkId(currentWeek), week: currentWeek, type: 'match',
      headline: `🏆 League Update: ${leader.name} Top The Table With ${leader.won * 3 + leader.drawn} Points — ${second?.name ?? 'Rivals'} Give Chase` });
  }

  // Relegation zone
  if (Math.random() > 0.7 && sorted.length >= 3) {
    const bottom = sorted[sorted.length - 1];
    items.push({ id: mkId(currentWeek), week: currentWeek, type: 'general',
      headline: `🔴 Relegation Battle: ${bottom.name} Sit Rock Bottom — Time Running Out For A Turnaround` });
  }

  // Transfer rumour
  if (Math.random() > 0.6 && clubs.length >= 2) {
    const c1 = clubs[randRange(0, clubs.length - 1)];
    const c2 = clubs[randRange(0, clubs.length - 1)];
    const star = [...c1.squad].sort((a, b) => b.rating - a.rating)[0];
    if (star && c1.id !== c2.id) {
      items.push({ id: mkId(currentWeek), week: currentWeek, type: 'transfer',
        headline: `💬 Transfer Whispers: ${c2.name} Reportedly Eyeing A Move For ${star.name} (${c1.name})` });
    }
  }

  // Player milestone
  if (Math.random() > 0.75) {
    const club = clubs[randRange(0, clubs.length - 1)];
    const scorer = [...club.squad].sort((a, b) => b.goals - a.goals)[0];
    if (scorer && scorer.goals >= 5) {
      items.push({ id: mkId(currentWeek), week: currentWeek, type: 'match',
        headline: `⚽ ${scorer.name} (${club.name}) Hits ${scorer.goals} Goals This Season — Leading The Golden Boot Race` });
    }
  }

  // Random injury at another club
  if (Math.random() > 0.7) {
    const others = clubs.filter(c => c.id !== userClubId);
    if (others.length > 0) {
      const club = others[randRange(0, others.length - 1)];
      const victim = club.squad[randRange(0, club.squad.length - 1)];
      if (victim) {
        items.push({ id: mkId(currentWeek), week: currentWeek, type: 'injury',
          headline: `🏥 Injury Setback For ${club.name}: ${victim.name} Faces Spell On Sidelines` });
      }
    }
  }

  // Young talent story
  if (Math.random() > 0.8) {
    const club = clubs[randRange(0, clubs.length - 1)];
    const youngster = club.squad.filter(p => p.age <= 21).sort((a, b) => b.rating - a.rating)[0];
    if (youngster) {
      items.push({ id: mkId(currentWeek), week: currentWeek, type: 'general',
        headline: `🌟 Wonderkid Watch: ${youngster.name} (${youngster.age}) Of ${club.name} Tipped For A Huge Future` });
    }
  }

  // User club headline (always included)
  const userClub = clubs.find(c => c.id === userClubId);
  if (userClub) {
    const pos = sorted.findIndex(c => c.id === userClubId) + 1;
    const posLabel = pos === 1
      ? 'Top Of The League'
      : pos <= 3
        ? `${pos}${['st', 'nd', 'rd'][pos - 1] ?? 'th'} — European Contention`
        : pos >= sorted.length - 2
          ? 'In The Danger Zone — Action Needed'
          : `${pos}th — Mid-Table Stability`;
    items.push({ id: mkId(currentWeek), week: currentWeek, type: 'match',
      headline: `📊 ${userClub.name} Sit ${posLabel}` });
  }

  return items;
}
