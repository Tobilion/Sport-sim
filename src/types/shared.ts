// Primitive union types used across multiple domains.
// Kept separate to break circular dependencies between club.ts and coach.ts.
export type TeamMentalityType = 'Tiki-Taka' | 'Gegenpressing' | 'Park the Bus' | 'Counter-Attack';
export type PlaystyleType = 'Attacking' | 'Balanced' | 'Defending';
export type TeamFormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2';
