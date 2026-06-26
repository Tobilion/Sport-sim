// All commentary string templates used during match simulation.
// Kept separate so they can be extended/localised without touching simulation logic.

export const DEF_TO_MID_PASSES = [
  "{passer} plays a calm short pass out from the back, building up carefully.",
  "{passer} steps forward, sending a crisp low ball straight to the midfield.",
  "{passer} wins a crucial header and nods it towards a teammate.",
  "{passer} clears it under heavy pressure, finding space near the circle.",
  "{passer} triggers an energetic quick break with an artistic diagonal pass.",
];

export const MID_TO_MID_PASSES = [
  "{passer} spins past an opponent, slotting a neat pass to the central flank.",
  "{passer} controls beautifully, playing a fast one-two to advance further.",
  "{passer} sprays a long curving pass out wide, unlocking the channel.",
  "{passer} orchestrates from deep, sliding a smart pass behind the defense.",
  "{passer} shrugs off a hard challenge and rolls the ball to safety.",
];

export const ATTACKING_PLAYS = [
  "{passer} whips a dangerous curving cross into the heart of the penalty area!",
  "{passer} threads a brilliant, eye-of-a-needle through ball behind the line!",
  "{passer} beats their marker with a quick dummy and looks up to spot a run.",
  "{passer} drives aggressively into the penalty box with rapid footwork!",
  "{passer} wins a freekick in a highly threatening position near the half-moon.",
];

export const SHOT_MISSES = [
  "{shooter} leaps high, releasing a powerful header but it flies inches over the crossbar!",
  "{shooter} attempts a spectacular bicycle kick, but it launches high into the stands!",
  "{shooter} fires a low hard driver, but it skims painfully wide of the left post.",
  "{shooter} gets a clean look, but rushes the half-volley and watches it rise too high.",
  "{shooter} tries an ambitious long-ranger that curls just wide of the top corner!",
];

export const SHOT_SAVES = [
  "{keeper} pulls off a breathtaking diving fingertip save to deny {shooter}!",
  "{keeper} stands tall at the near post, blocking a fierce drive from {shooter}!",
  "{keeper} reads the shot perfectly, leaping to catch a curving effort under the bar.",
  "{shooter} shoots low, but {keeper} reacts instantly to deflect it wide with his boot!",
  "{shooter} fires a point-blank volley, but {keeper} punches it clear heroically!",
];

export const GOAL_CELEBRATIONS = [
  "GOAL! {shooter} blasts a stunning strike into the roof of the net! {passer} with the perfect assist!",
  "GOAL! {shooter} rises above everyone to thump a robust header into the bottom corner!",
  "GOAL! {shooter} keeps their cool, slotting a neat finish under the rushing goalkeeper!",
  "GOAL! {shooter} curls a magnificent free-kick completely out of the goalkeeper's reach!",
  "GOAL! A tap-in! {shooter} pounces on a loose ball in the six-yard box and rolls it over the line!",
];

export const FOULS_AND_CARDS = [
  "{player} commits a clumsy late sliding challenge, halting the quick break.",
  "Foul in midfield! {player} pulls back an opponent's jersey deliberately.",
  "High boot! {player} is penalised for a dangerous high-kick attempt.",
  "{player} goes in aggressively with two feet, sparking angry confrontations.",
];

export const GOAL_REPLAY_TEMPLATES = [
  "{scorer} picks up the ball on the edge of the box and unleashes a thunderbolt into the top corner!",
  "A perfectly-weighted through ball finds {scorer} in behind the last defender. One touch, and it's in the net!",
  "{scorer} rises highest from a corner kick, powering a header past the goalkeeper!",
  "Chaos in the box! The ball breaks to {scorer} who sweeps it home from close range!",
  "{scorer} cuts inside, beats two defenders and curls a delicious effort into the far corner!",
  "A quick counter-attack — {scorer} races clear and confidently chips the advancing keeper!",
  "Penalty! {scorer} steps up, sends the goalkeeper the wrong way — GOAL!",
  "{scorer} latches onto a deflected cross and volleys clinically into the bottom corner!",
];

export const HIGHLIGHTS_OPENERS = [
  "An enthralling contest as both sides created plenty of chances.",
  "A captivating match that kept fans on the edge of their seats throughout.",
  "Intensity from the first whistle, with both teams battling fiercely.",
  "A closely-fought encounter that showcased the best of the beautiful game.",
];

export const HIGHLIGHTS_MIDDLES = [
  "{homeTeam} dominated the early exchanges before {awayTeam} found their footing.",
  "Both sides traded blows with chances at either end throughout the 90 minutes.",
  "{awayTeam} started brightly but {homeTeam} grew into the game as the half progressed.",
  "The midfield battle proved crucial, with both managers making key tactical interventions.",
];

export const HIGHLIGHTS_CLOSERS = [
  "Ultimately the scoreline reflected the quality on show.",
  "A deserved result, though the defeated side will feel they had enough chances.",
  "The fans were treated to a memorable afternoon of football.",
  "Both managers will have plenty to ponder ahead of the next fixture.",
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
