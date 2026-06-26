import type { BracketNode } from '../../types';

export function generateCupBracket(clubIds: string[]): BracketNode[] {
  const bracket: BracketNode[] = [];
  const r32Teams = [...clubIds].slice(0, 32);
  while (r32Teams.length < 32) r32Teams.push(`placeholder-${r32Teams.length}`);

  // Fisher-Yates shuffle for dynamic pairings
  for (let i = r32Teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r32Teams[i], r32Teams[j]] = [r32Teams[j], r32Teams[i]];
  }

  for (let i = 0; i < 16; i++) {
    bracket.push({ id: `cup-R32-${i + 1}`, round: 'R32', roundIndex: i, homeClubId: r32Teams[i * 2], awayClubId: r32Teams[i * 2 + 1], isCompleted: false });
  }
  for (let i = 0; i < 8; i++) bracket.push({ id: `cup-R16-${i + 1}`, round: 'R16', roundIndex: i, isCompleted: false });
  for (let i = 0; i < 4; i++) bracket.push({ id: `cup-QF-${i + 1}`, round: 'QF', roundIndex: i, isCompleted: false });
  for (let i = 0; i < 2; i++) bracket.push({ id: `cup-SF-${i + 1}`, round: 'SF', roundIndex: i, isCompleted: false });
  bracket.push({ id: 'cup-F-1', round: 'F', roundIndex: 0, isCompleted: false });

  return bracket;
}

type CupRound = BracketNode['round'];

export function advanceCupRound(
  bracket: BracketNode[],
  activeRound: CupRound,
): { updatedBracket: BracketNode[]; nextRound: CupRound | 'FINISHED' } {
  const b = [...bracket];

  const winnersOf = (round: CupRound) => b.filter((n) => n.round === round).map((n) => n.winnerClubId);
  const fillRound = (targetPrefix: string, count: number, winners: (string | undefined)[]) => {
    for (let i = 0; i < count; i++) {
      const node = b.find((n) => n.id === `${targetPrefix}-${i + 1}`);
      if (node) { node.homeClubId = winners[i * 2] ?? undefined; node.awayClubId = winners[i * 2 + 1] ?? undefined; }
    }
  };

  const transitions: Record<CupRound, { target: string; count: number; next: CupRound | 'FINISHED' }> = {
    R32: { target: 'cup-R16', count: 8, next: 'R16' },
    R16: { target: 'cup-QF', count: 4, next: 'QF' },
    QF: { target: 'cup-SF', count: 2, next: 'SF' },
    SF: { target: 'cup-F', count: 1, next: 'F' },
    F: { target: '', count: 0, next: 'FINISHED' },
  };

  const t = transitions[activeRound];
  if (t.count > 0) fillRound(t.target, t.count, winnersOf(activeRound));
  return { updatedBracket: b, nextRound: t.next };
}
