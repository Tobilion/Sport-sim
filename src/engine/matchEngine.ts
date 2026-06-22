import {
  Club,
  LiveMatchSimulation,
  MatchEvent,
  Fixture,
  LiveOdds,
  PostMatchAnalysis,
  GoalReplay,
} from "../types";
import { randRange } from "../data/names";

// Commentary Templates for immersive simulation
const DEF_TO_MID_PASSES = [
  "{passer} plays a calm short pass out from the back, building up carefully.",
  "{passer} steps forward, sending a crisp low ball straight to the midfield.",
  "{passer} wins a crucial header and nods it towards a teammate.",
  "{passer} clears it under heavy pressure, finding space near the circle.",
  "{passer} triggers an energetic quick break with an artistic diagonal pass.",
];

const MID_TO_MID_PASSES = [
  "{passer} spins past an opponent, slotting a neat pass to the central flank.",
  "{passer} controls beautifully, playing a fast one-two to advance further.",
  "{passer} sprays a long curving pass out wide, unlocking the channel.",
  "{passer} orchestrates from deep, sliding a smart pass behind the defense.",
  "{passer} shrugs off a hard challenge and rolls the ball to safety.",
];

const ATTACKING_PLAYS = [
  "{passer} whips a dangerous curving cross into the heart of the penalty area!",
  "{passer} threads a brilliant, eye-of-a-needle through ball behind the line!",
  "{passer} beats their marker with a quick dummy and looks up to spot a run.",
  "{passer} drives aggressively into the penalty box with rapid footwork!",
  "{passer} wins a freekick in a highly threatening position near the half-moon.",
];

const SHOT_MISSES = [
  "{shooter} leaps high, releasing a powerful header but it flies inches over the crossbar!",
  "{shooter} attempts a spectacular bicycle kick, but it launches high into the stands!",
  "{shooter} fires a low hard driver, but it skims painfully wide of the left post.",
  "{shooter} gets a clean look, but rushes the half-volley and watches it rise too high.",
  "{shooter} tries an ambitious long-ranger that curls just wide of the top corner!",
];

const SHOT_SAVES = [
  "{keeper} pulls off a breathtaking diving fingertip save to deny {shooter}!",
  "{keeper} stands tall at the near post, blocking a fierce drive from {shooter}!",
  "{keeper} reads the shot perfectly, leaping to catch a curving effort under the bar.",
  "{shooter} shoots low, but {keeper} reacts instantly to deflect it wide with his boot!",
  "{shooter} fires a point-blank volley, but {keeper} punches it clear heroically!",
];

const GOAL_CELEBRATIONS = [
  "GOAL! {shooter} blasts a stunning strike into the roof of the net! {passer} with the perfect assist!",
  "GOAL! {shooter} rises above everyone to thump a robust header into the bottom corner!",
  "GOAL! {shooter} keeps their cool, slotting a neat finish under the rushing goalkeeper!",
  "GOAL! {shooter} curls a magnificent free-kick completely out of the goalkeeper's reach!",
  "GOAL! A tap-in! {shooter} pounces on a loose ball in the six-yard box and rolls it over the line!",
];

const FOULS_AND_CARDS = [
  "{player} commits a clumsy late sliding challenge, halting the quick break.",
  "Foul in midfield! {player} pulls back an opponent's jersey deliberately.",
  "High boot! {player} is penalised for a dangerous high-kick attempt.",
  "{player} goes in aggressively with two feet, sparking angry confrontations.",
];

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
    possession: Math.random() > 0.5 ? "home" : "away",
    ballX: 50,
    ballY: 50,
    zone: "MID",
    events: [
      {
        tick: 0,
        minute: 0,
        type: "info",
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

export function simulateTick(
  sim: LiveMatchSimulation,
  homeClub: Club,
  awayClub: Club,
): LiveMatchSimulation {
  if (sim.isFinished) return sim;

  const nextTick = sim.tick + 1;
  const minute = Math.min(90, Math.floor((nextTick / 30) * 90));
  const newEvents: MatchEvent[] = [];

  // 1. Mentality Tactical Modifiers
  const homeMentality = homeClub.mentality;
  const awayMentality = awayClub.mentality;

  // Average team ratings (Starter-bound for realistic power match-ups)
  const homeStarters = homeClub.squad.filter((p) => p.isStarting);
  const awayStarters = awayClub.squad.filter((p) => p.isStarting);

  const homeAvgRating =
    homeStarters.reduce((acc, p) => acc + p.rating, 0) /
    (homeStarters.length || 1);
  const awayAvgRating =
    awayStarters.reduce((acc, p) => acc + p.rating, 0) /
    (awayStarters.length || 1);

  // Training & tactics bonuses
  const homeDefBonus =
    (homeClub.trainingFacilities - 1) * 0.5 +
    (homeClub.coaches
      ?.filter((c) => c.specialty === "Defending")
      .reduce((acc, c) => acc + c.rating / 50, 0) || 0);
  const homePassBonus =
    (homeClub.tacticsFacilities - 1) * 0.5 +
    (homeClub.coaches
      ?.filter((c) => c.specialty === "Tactics" || c.specialty === "Attacking")
      .reduce((acc, c) => acc + c.rating / 50, 0) || 0);
  const awayDefBonus =
    (awayClub.trainingFacilities - 1) * 0.5 +
    (awayClub.coaches
      ?.filter((c) => c.specialty === "Defending")
      .reduce((acc, c) => acc + c.rating / 50, 0) || 0);
  const awayPassBonus =
    (awayClub.tacticsFacilities - 1) * 0.5 +
    (awayClub.coaches
      ?.filter((c) => c.specialty === "Tactics" || c.specialty === "Attacking")
      .reduce((acc, c) => acc + c.rating / 50, 0) || 0);

  // GK, Set Pieces and Corners specialty coach bonuses
  const homeGKBonus =
    (homeClub.coaches
      ?.filter((c) => c.specialty === "Goalkeeping")
      .reduce((acc, c) => acc + c.rating / 40, 0) || 0);
  const homeSetPieceBonus =
    (homeClub.coaches
      ?.filter((c) => c.specialty === "Set Pieces" || c.specialty === "Corners")
      .reduce((acc, c) => acc + c.rating / 40, 0) || 0);

  const awayGKBonus =
    (awayClub.coaches
      ?.filter((c) => c.specialty === "Goalkeeping")
      .reduce((acc, c) => acc + c.rating / 40, 0) || 0);
  const awaySetPieceBonus =
    (awayClub.coaches
      ?.filter((c) => c.specialty === "Set Pieces" || c.specialty === "Corners")
      .reduce((acc, c) => acc + c.rating / 40, 0) || 0);

  let homePossessionWeight =
    50 + (homeAvgRating - awayAvgRating) + (homePassBonus - awayPassBonus);
  let awayPossessionWeight = 100 - homePossessionWeight;

  const hPlaystyle =
    sim.homeClubId === homeClub.id && sim.userPlaystyle
      ? sim.userPlaystyle
      : homeClub.playstyle;
  const aPlaystyle =
    sim.awayClubId === awayClub.id && sim.userPlaystyle
      ? sim.userPlaystyle
      : awayClub.playstyle;

  if (hPlaystyle === "Attacking") homePossessionWeight += 4;
  if (hPlaystyle === "Defending") homePossessionWeight -= 4;
  if (aPlaystyle === "Attacking") homePossessionWeight -= 4;
  if (aPlaystyle === "Defending") homePossessionWeight += 4;

  if (homeMentality === "Tiki-Taka") homePossessionWeight += 6;
  if (awayMentality === "Tiki-Taka") homePossessionWeight -= 6;
  if (homeMentality === "Park the Bus") homePossessionWeight -= 11;
  if (awayMentality === "Park the Bus") homePossessionWeight += 11;

  homePossessionWeight = Math.min(80, Math.max(20, homePossessionWeight));

  const possessionRoll = randRange(1, 100);
  const currentPossession: "home" | "away" =
    possessionRoll <= homePossessionWeight ? "home" : "away";

  // Active players
  const getStartingPlayersByPos = (
    club: Club,
    pos: "GK" | "DEF" | "MID" | "ATT",
  ) =>
    club.squad.filter(
      (p) => p.position === pos && p.isStarting && p.stamina > 5,
    );
  const getGK = (club: Club) =>
    club.squad.find((p) => p.position === "GK" && p.isStarting) ||
    club.squad.find((p) => p.position === "GK") ||
    club.squad[0];

  const currentTeam = currentPossession === "home" ? homeClub : awayClub;
  const opposingTeam = currentPossession === "home" ? awayClub : homeClub;
  const isHomePossession = currentPossession === "home";

  // Zone transitions
  let currentZone = sim.zone;
  let ballX = sim.ballX;
  let ballY = sim.ballY;

  const transitionChance = randRange(1, 100);
  let commentaryText = "";
  let eventType: MatchEvent["type"] = "info";
  let eventPlayerName = "";

  if (currentPossession === sim.possession) {
    if (sim.zone === "DEF") {
      if (transitionChance > 25) {
        // increased transit probability
        currentZone = "MID";
        ballX = isHomePossession ? randRange(42, 58) : randRange(42, 58);
        ballY = randRange(15, 85);
        const mids = getStartingPlayersByPos(currentTeam, "MID");
        const passer = mids.length
          ? mids[randRange(0, mids.length - 1)].name
          : "Midfielder";
        commentaryText = DEF_TO_MID_PASSES[
          randRange(0, DEF_TO_MID_PASSES.length - 1)
        ].replace("{passer}", passer);
      } else {
        ballX = isHomePossession ? randRange(15, 30) : randRange(70, 85);
        commentaryText = `Possession restarts deep as ${currentTeam.name} circulate it across their defensive lines.`;
      }
    } else if (sim.zone === "MID") {
      if (transitionChance > 32) {
        // high rate of transitions for dramatic goals flow
        currentZone = "ATT";
        ballX = isHomePossession ? randRange(75, 95) : randRange(5, 25);
        ballY = randRange(10, 90);
        const mids = getStartingPlayersByPos(currentTeam, "MID");
        const passer = mids.length
          ? mids[randRange(0, mids.length - 1)].name
          : "Midfielder";
        commentaryText = ATTACKING_PLAYS[
          randRange(0, ATTACKING_PLAYS.length - 1)
        ].replace("{passer}", passer);
      } else {
        ballX = randRange(40, 60);
        ballY = randRange(20, 80);
        const mids = getStartingPlayersByPos(currentTeam, "MID");
        const passer = mids.length
          ? mids[randRange(0, mids.length - 1)].name
          : "Midfielder";
        commentaryText = MID_TO_MID_PASSES[
          randRange(0, MID_TO_MID_PASSES.length - 1)
        ].replace("{passer}", passer);
      }
    } else {
      // Attacking Shot Engine: Highly clinically tuned for professional, realistic football results
      eventType = "shot_miss";
      const atts = getStartingPlayersByPos(currentTeam, "ATT").concat(
        getStartingPlayersByPos(currentTeam, "MID"),
      );
      const shooter = atts.length
        ? atts[randRange(0, atts.length - 1)]
        : currentTeam.squad[randRange(0, 3)];
      eventPlayerName = shooter.name;

      if (isHomePossession) sim.homeShots++;
      else sim.awayShots++;

      // Shift base goal conversion to 46% (was 30% default, hence why goals were extremely rare previously!)
      let goalRollThreshold = 46 + (shooter.rating - 75);

      const cPlaystyle = isHomePossession ? hPlaystyle : aPlaystyle;
      if (cPlaystyle === "Attacking") goalRollThreshold += 8;
      if (cPlaystyle === "Defending") goalRollThreshold -= 5;

      if (currentTeam.mentality === "Tiki-Taka") goalRollThreshold += 12;
      if (opposingTeam.mentality === "Park the Bus") goalRollThreshold -= 18;
      if (currentTeam.mentality === "Counter-Attack" && sim.tick % 4 === 0)
        goalRollThreshold += 16;

      // Set Pieces/Corners coach boost
      const activeSetPieceBonus = isHomePossession ? homeSetPieceBonus : awaySetPieceBonus;
      if (sim.tick % 5 === 0) { // Set piece situations
        goalRollThreshold += 4 + activeSetPieceBonus * 1.5;
      }

      // Weather Modifiers
      if (sim.weather === 'Heavy Rain') goalRollThreshold -= 8;
      if (sim.weather === 'Snow') goalRollThreshold -= 12;
      if (sim.weather === 'Extreme Heat') goalRollThreshold -= 4; // fatigue

      // Comeback mechanic: trailing team gets a boost in the last 6 ticks (mins ~72–90)
      if (nextTick >= 24) {
        const isTrailing = isHomePossession
          ? sim.homeScore < sim.awayScore
          : sim.awayScore < sim.homeScore;
        if (isTrailing) goalRollThreshold += 8;
      }

      const oppGK = getGK(opposingTeam);
      const opposingGKBonus = isHomePossession ? awayGKBonus : homeGKBonus;
      goalRollThreshold -=
        (oppGK.rating - 75) + (isHomePossession ? awayDefBonus : homeDefBonus) + (opposingGKBonus * 1.2);

      const shotRoll = randRange(1, 100);

      if (shotRoll <= Math.max(12, goalRollThreshold)) {
        // Clinical goal scorer!
        eventType = "goal";
        if (isHomePossession) {
          sim.homeScore++;
          sim.homeShooters.push(shooter.name);
        } else {
          sim.awayScore++;
          sim.awayShooters.push(shooter.name);
        }
        if (isHomePossession) sim.homeShotsOnTarget++;
        else sim.awayShotsOnTarget++;

        const isCup = sim.fixtureId.startsWith("cup-");
        if (isCup) {
          shooter.tournamentGoals = (shooter.tournamentGoals || 0) + 1;
        } else {
          shooter.goals++;
        }
        shooter.morale = Math.min(100, shooter.morale + 10);

        const midfielders = getStartingPlayersByPos(currentTeam, "MID");
        if (midfielders.length) {
          const assister = midfielders[randRange(0, midfielders.length - 1)];
          if (isCup) {
            assister.tournamentAssists = (assister.tournamentAssists || 0) + 1;
          } else {
            assister.assists++;
          }
          assister.morale = Math.min(100, assister.morale + 5);
          commentaryText = GOAL_CELEBRATIONS[
            randRange(0, GOAL_CELEBRATIONS.length - 1)
          ]
            .replace("{shooter}", shooter.name)
            .replace("{passer}", assister.name);
        } else {
          commentaryText = `GOAL! ${shooter.name} makes a beautiful solo run, dummying the defenseman and placing it beautifully home!`;
        }

        currentZone = "MID";
        ballX = 50;
        ballY = 50;
      } else if (shotRoll <= Math.max(28, goalRollThreshold + 32)) {
        // GK error: 3% chance they drop it and it becomes a goal
        const gkErrorRoll = randRange(1, 100);
        const gkErrorChance = oppGK.stamina < 40 ? 6 : 3;
        if (gkErrorRoll <= gkErrorChance) {
          // GK error — goal scored!
          eventType = "goal";
          if (isHomePossession) {
            sim.homeScore++;
            sim.homeShooters.push(shooter.name);
            sim.homeShotsOnTarget++;
          } else {
            sim.awayScore++;
            sim.awayShooters.push(shooter.name);
            sim.awayShotsOnTarget++;
          }
          const isCup = sim.fixtureId.startsWith("cup-");
          if (isCup) { shooter.tournamentGoals = (shooter.tournamentGoals || 0) + 1; }
          else { shooter.goals++; }
          shooter.morale = Math.min(100, shooter.morale + 10);
          oppGK.morale = Math.max(0, oppGK.morale - 20);
          commentaryText = `GOAL! Goalkeeper error! ${oppGK.name} fumbles a routine save and ${shooter.name} pounces on the loose ball!`;
          currentZone = "MID";
          ballX = 50;
          ballY = 50;
        } else {
          eventType = "shot_saved";
          if (isHomePossession) sim.homeShotsOnTarget++;
          else sim.awayShotsOnTarget++;

          const isCup = sim.fixtureId.startsWith("cup-");
          if (isCup) {
            oppGK.tournamentSaves = (oppGK.tournamentSaves || 0) + 1;
          } else {
            oppGK.saves = (oppGK.saves || 0) + 1;
          }
          oppGK.morale = Math.min(100, oppGK.morale + 5);
          commentaryText = SHOT_SAVES[randRange(0, SHOT_SAVES.length - 1)]
            .replace("{keeper}", oppGK.name)
            .replace("{shooter}", shooter.name);

          currentZone = "ATT";
          ballX = isHomePossession ? 95 : 5;
          ballY = Math.random() > 0.5 ? 90 : 10;
        }
      } else {
        commentaryText = SHOT_MISSES[
          randRange(0, SHOT_MISSES.length - 1)
        ].replace("{shooter}", shooter.name);
        currentZone = "DEF";
        ballX = isHomePossession ? 15 : 85;
      }
    }
  } else {
    // Turnover, Clean Interceptions, or Card bookings
    const defs = getStartingPlayersByPos(opposingTeam, "DEF");
    const defender = defs.length
      ? defs[randRange(0, defs.length - 1)]
      : opposingTeam.squad[randRange(1, 4)];

    // Reduced default foul rate from 15% to 11% so red bookings don't occur every single game
    let foulChance = 11;
    if (opposingTeam.mentality === "Gegenpressing") foulChance += 8;
    if (sim.weather === 'Heavy Rain') foulChance += 4;
    if (sim.weather === 'Extreme Heat') foulChance += 3;
    if (sim.weather === 'Snow') foulChance += 2;

    if (randRange(1, 100) <= foulChance) {
      eventType = "foul";
      eventPlayerName = defender.name;
      if (!isHomePossession) sim.homeConcededFouls++;
      else sim.awayConcededFouls++;

      commentaryText = FOULS_AND_CARDS[
        randRange(0, FOULS_AND_CARDS.length - 1)
      ].replace("{player}", defender.name);

      const cardRoll = randRange(1, 100);

      // Reconfigured cards logic to represent realistic events
      const isCup = sim.fixtureId.startsWith("cup-");
      if (cardRoll <= 16) {
        // 16% of fouls result in Yellow Card
        eventType = "yellow_card";
        if (isCup) {
          defender.tournamentYellowCards =
            (defender.tournamentYellowCards || 0) + 1;
        } else {
          defender.yellowCards++;
        }
        commentaryText += ` The referee stops play and delivers a YELLOW CARD warnings to ${defender.name}.`;

        const currentYellows = isCup
          ? defender.tournamentYellowCards || 0
          : defender.yellowCards;
        if (currentYellows >= 2) {
          eventType = "red_card";
          if (isCup) {
            defender.tournamentRedCards =
              (defender.tournamentRedCards || 0) + 1;
          } else {
            defender.redCards++;
          }
          defender.morale = Math.max(20, defender.morale - 30);
          commentaryText += ` Disastrous! It is a SECOND yellow card, resulting in a RED expulsion! ${defender.name} makes his way off.`;
        }
      } else if (cardRoll === 100) {
        // 1% chance on fouls results in an immediate Straight Red card. Extremely realistic!
        eventType = "red_card";
        if (isCup) {
          defender.tournamentRedCards = (defender.tournamentRedCards || 0) + 1;
        } else {
          defender.redCards++;
        }
        defender.morale = Math.max(10, defender.morale - 40);
        commentaryText = `RED CARD! Direct expulsion! ${defender.name} lunges in with high studs, completely sliding a dangerous challenge. The referee instantly pulls out the red!`;
      }
    } else {
      commentaryText = `Interception! ${defender.name} reads the play perfectly, tackling clean to break down ${currentTeam.name}'s build-up.`;
    }

    currentZone =
      sim.zone === "ATT" ? "DEF" : sim.zone === "DEF" ? "ATT" : "MID";
    ballX = isHomePossession ? randRange(25, 45) : randRange(55, 75);
    ballY = randRange(20, 80);
  }

  // 4. Special Match phases
  if (nextTick === 15) {
    currentZone = "MID";
    ballX = 50;
    ballY = 50;
    newEvents.push({
      tick: nextTick,
      minute: 45,
      type: "half_time",
      description: `HT: Referee blows the whistle for Half-Time! Players make their way to the dressing rooms. Match Score: ${homeClub.name} ${sim.homeScore} - ${sim.awayScore} ${awayClub.name}. Managers prepare deep tactical adjustments.`,
    });
  } else if (nextTick === 30) {
    currentZone = "MID";
    ballX = 50;
    ballY = 50;
    sim.isFinished = true;
    newEvents.push({
      tick: nextTick,
      minute: 90,
      type: "full_time",
      description: `FT: MATCH ENDED! The referee blows the final whistle. The stadium erupts in cheers! Final Score: ${homeClub.name} ${sim.homeScore} - ${sim.awayScore} ${awayClub.name}`,
    });
  } else {
    if (commentaryText) {
      newEvents.push({
        tick: nextTick,
        minute,
        type: eventType,
        playerName: eventPlayerName,
        description: commentaryText,
      });
    }
  }

  if (currentPossession === "home") sim.homePossessionScore += 2;
  else sim.awayPossessionScore += 2;

  // Stamina decays ONLY for players who are actively in Starting lineups (isStarting === true)
  homeClub.squad.forEach((p) => {
    if (p.isStarting) {
      let decay = 0.55 + (100 - p.rating) * 0.005;
      if (homeMentality === "Gegenpressing") decay += 0.35;
      if (homeClub.cardioFacilities > 1)
        decay -= (homeClub.cardioFacilities - 1) * 0.085;
      p.stamina = Math.max(10, Number((p.stamina - decay).toFixed(1)));
    } else {
      // On bench: slow minor rest recovery during real-time game
      p.stamina = Math.min(100, Number((p.stamina + 0.1).toFixed(1)));
    }
  });

  awayClub.squad.forEach((p) => {
    if (p.isStarting) {
      let decay = 0.55 + (100 - p.rating) * 0.005;
      if (awayMentality === "Gegenpressing") decay += 0.35;
      if (awayClub.cardioFacilities > 1)
        decay -= (awayClub.cardioFacilities - 1) * 0.085;
      p.stamina = Math.max(10, Number((p.stamina - decay).toFixed(1)));
    } else {
      p.stamina = Math.min(100, Number((p.stamina + 0.1).toFixed(1)));
    }
  });

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

// Simulated background match without real-time ticker
export function simulateEntireMatch(
  fixtureId: string,
  homeClub: Club,
  awayClub: Club,
): Fixture {
  let sim = initLiveMatch(fixtureId, homeClub, awayClub);

  while (!sim.isFinished) {
    // Check if assistant coach needs to make substitutions at Half-Time (tick 15)
    if (sim.tick === 14) {
      runAssistantSubstitution(homeClub);
      runAssistantSubstitution(awayClub);
    }
    sim = simulateTick(sim, homeClub, awayClub);
  }

  // Calculate final statistics
  const totalPoss = sim.homePossessionScore + sim.awayPossessionScore;
  const homePct = Math.round((sim.homePossessionScore / totalPoss) * 100);
  const awayPct = 100 - homePct;

  // Rating increments ONLY for starting players (non-starters don't get match stats here)
  const goalDiff = sim.homeScore - sim.awayScore;
  homeClub.squad.forEach((p) => {
    if (p.isStarting) {
      let rating =
        randRange(62, 81) / 10 +
        goalDiff * 0.35 +
        p.goals * 1.6 +
        p.assists * 1.1;
      if (p.redCards > 0) rating = Math.max(3.0, rating - 3.8);
      p.matchRatings = [
        ...p.matchRatings,
        Number(Math.min(10, Math.max(3.2, rating)).toFixed(1)),
      ];
    }
  });
  awayClub.squad.forEach((p) => {
    if (p.isStarting) {
      let rating =
        randRange(62, 81) / 10 -
        goalDiff * 0.35 +
        p.goals * 1.6 +
        p.assists * 1.1;
      if (p.redCards > 0) rating = Math.max(3.0, rating - 3.8);
      p.matchRatings = [
        ...p.matchRatings,
        Number(Math.min(10, Math.max(3.2, rating)).toFixed(1)),
      ];
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
    awayPossession: awayPct,
    homeShots: sim.homeShots,
    awayShots: sim.awayShots,
    homeShotsOnTarget: sim.homeShotsOnTarget,
    awayShotsOnTarget: sim.awayShotsOnTarget,
  };
}

// Helper auto-substitution analyzer for Assistant Coach
export function runAssistantSubstitution(club: Club) {
  // Finds any starter with low stamina (below 65) or extremely low morale
  const lowStaminaStarters = club.squad
    .filter((p) => p.isStarting && p.stamina < 65)
    .sort((a, b) => a.stamina - b.stamina);

  if (lowStaminaStarters.length === 0) return;

  const benchPlayers = club.squad.filter(
    (p) => !p.isStarting && p.stamina >= 80,
  );
  if (benchPlayers.length === 0) return;

  // Substitute up to 2 players maximum at half-time
  // Substitute up to 2 players maximum at half-time
  const subsCount = Math.min(2, lowStaminaStarters.length, benchPlayers.length);

  for (let i = 0; i < subsCount; i++) {
    const starter = lowStaminaStarters[i];
    const sub =
      benchPlayers.find(
        (b) => b.position === starter.position && !b.isStarting,
      ) || benchPlayers.find((b) => !b.isStarting);

    if (sub) {
      starter.isStarting = false;
      sub.isStarting = true;
    }
  }
}

export function calculatePreMatchOdds(
  homeClub: Club,
  awayClub: Club,
): LiveOdds {
  const homePower =
    homeClub.squad.reduce((s, p) => s + p.rating, 0) / homeClub.squad.length;
  const awayPower =
    awayClub.squad.reduce((s, p) => s + p.rating, 0) / awayClub.squad.length;
  const diffStrength = homePower - awayPower;

  const homeWin = parseFloat(
    Math.min(15.0, Math.max(1.05, 2.2 - diffStrength * 0.15)).toFixed(2),
  );
  const draw = parseFloat(
    Math.min(6.5, Math.max(2.1, 3.2 - Math.abs(diffStrength) * 0.05)).toFixed(2),
  );
  const awayWin = parseFloat(
    Math.min(15.0, Math.max(1.05, 2.6 + diffStrength * 0.15)).toFixed(2),
  );
  const over25 = parseFloat(
    Math.min(3.5, Math.max(1.3, 1.85 - diffStrength * 0.02)).toFixed(2),
  );
  const under25 = parseFloat(
    Math.min(3.5, Math.max(1.3, 1.9 + diffStrength * 0.02)).toFixed(2),
  );
  return { homeWin, draw, awayWin, over25, under25 };
}

export function quickSimulateFixture(homeClub: Club, awayClub: Club): Fixture {
  return simulateEntireMatch("dummy-id", homeClub, awayClub);
}

const GOAL_REPLAY_TEMPLATES = [
  "{scorer} picks up the ball on the edge of the box and unleashes a thunderbolt into the top corner!",
  "A perfectly-weighted through ball finds {scorer} in behind the last defender. One touch, and it's in the net!",
  "{scorer} rises highest from a corner kick, powering a header past the goalkeeper!",
  "Chaos in the box! The ball breaks to {scorer} who sweeps it home from close range!",
  "{scorer} cuts inside, beats two defenders and curls a delicious effort into the far corner!",
  "A quick counter-attack — {scorer} races clear and confidently chips the advancing keeper!",
  "Penalty! {scorer} steps up, sends the goalkeeper the wrong way — GOAL!",
  "{scorer} latches onto a deflected cross and volleys clinically into the bottom corner!",
];

const HIGHLIGHTS_OPENERS = [
  "An enthralling contest as both sides created plenty of chances.",
  "A captivating match that kept fans on the edge of their seats throughout.",
  "Intensity from the first whistle, with both teams battling fiercely.",
  "A closely-fought encounter that showcased the best of the beautiful game.",
];
const HIGHLIGHTS_MIDDLES = [
  "{homeTeam} dominated the early exchanges before {awayTeam} found their footing.",
  "Both sides traded blows with chances at either end throughout the 90 minutes.",
  "{awayTeam} started brightly but {homeTeam} grew into the game as the half progressed.",
  "The midfield battle proved crucial, with both managers making key tactical interventions.",
];
const HIGHLIGHTS_CLOSERS = [
  "Ultimately the scoreline reflected the quality on show.",
  "A deserved result, though the defeated side will feel they had enough chances.",
  "The fans were treated to a memorable afternoon of football.",
  "Both managers will have plenty to ponder ahead of the next fixture.",
];

export function generatePostMatchAnalysis(
  sim: LiveMatchSimulation,
  homeClub: Club,
  awayClub: Club,
): PostMatchAnalysis {
  const playerRatings: Record<string, number> = {};
  const allGoalReplays: GoalReplay[] = [];

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

  homeClub.squad.forEach(p => {
    if (p.isStarting) playerRatings[p.id] = calcRating(p, true);
  });
  awayClub.squad.forEach(p => {
    if (p.isStarting) playerRatings[p.id] = calcRating(p, false);
  });

  let motmId = '';
  let motmRating = -1;
  const checkTeam = sim.homeScore !== sim.awayScore
    ? (sim.homeScore > sim.awayScore ? homeClub : awayClub)
    : homeClub;
  checkTeam.squad.forEach(p => {
    if (p.isStarting && (playerRatings[p.id] || 0) > motmRating) {
      motmRating = playerRatings[p.id] || 0;
      motmId = p.id;
    }
  });
  if (!motmId) {
    awayClub.squad.forEach(p => {
      if (p.isStarting && (playerRatings[p.id] || 0) > motmRating) {
        motmRating = playerRatings[p.id] || 0;
        motmId = p.id;
      }
    });
  }

  let replayMinute = 5;
  sim.events.forEach(ev => {
    if (ev.type === 'goal') {
      const minute = ev.minute || replayMinute;
      replayMinute = minute + 3;
      const scorer = ev.playerName || 'Unknown';
      const template = GOAL_REPLAY_TEMPLATES[randRange(0, GOAL_REPLAY_TEMPLATES.length - 1)];
      allGoalReplays.push({
        minute,
        scorer,
        description: template.replace('{scorer}', scorer),
      });
    }
  });

  const pick = (arr: string[]) => arr[randRange(0, arr.length - 1)];
  const highlightsText = [
    pick(HIGHLIGHTS_OPENERS),
    pick(HIGHLIGHTS_MIDDLES).replace('{homeTeam}', homeClub.name).replace('{awayTeam}', awayClub.name),
    pick(HIGHLIGHTS_CLOSERS),
  ].join(' ');

  const totalPoss = (sim.homePossessionScore + sim.awayPossessionScore) || 1;
  const homeFouls = sim.events.filter(e =>
    e.teamId === homeClub.id && (e.type === 'foul' || e.type === 'yellow_card' || e.type === 'red_card')).length;
  const awayFouls = sim.events.filter(e =>
    e.teamId === awayClub.id && (e.type === 'foul' || e.type === 'yellow_card' || e.type === 'red_card')).length;

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
    goalReplays: allGoalReplays,
  };
}
