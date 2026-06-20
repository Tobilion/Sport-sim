# Requirements Document

## Introduction

This document specifies requirements for the **Season Overhaul** of Sportsim-Pro — a React 18 / TypeScript / Vite football simulation game persisted in localStorage. The overhaul covers nine areas: a tabbed Fixtures screen with free match selection, read-only protection for non-user matches, an improved half-time substitution panel, an expanded transfer market, a season-continuation data-reset fix, a new Trophies tab, solidified group-stage-to-knockout qualification logic, an accurate README, and a final GitHub push.

The app simulates a dual-season campaign: a 19-round Elite SuperLeague (20 clubs) and a Prestige Champions Cup (32–36 clubs, 8 groups → R16 → QF → SF → Final) running concurrently across 26 scheduled weeks.

---

## Glossary

- **App**: The Sportsim-Pro React SPA.
- **Fixtures_Screen**: The tab in the App that lists all scheduled matches for the current campaign.
- **League_Fixtures**: The set of 19-round round-robin fixtures for the 20-club Elite SuperLeague.
- **Tournament_Fixtures**: The group-stage and knockout fixtures for the Prestige Champions Cup.
- **Match_Simulation**: The tick-based live match engine (`matchEngine.ts`) that runs a match in 30 ticks.
- **User_Club**: The club the player has chosen to manage in the active save slot.
- **Non_User_Match**: A fixture in which neither team is the User_Club.
- **Half_Time_Modal**: The substitution panel that appears at match tick 15.
- **Transfer_Market**: The scouted player list rendered in the ManagerSuite Transfers tab.
- **Season_Reset**: The process of starting a new season (same or different club) from Week 1.
- **Trophies_Tab**: A new persistent UI tab recording seasonal award winners.
- **Group_Stage**: The three-week round-robin phase (Weeks 3, 6, 9) of the Champions Cup involving 32 clubs in 8 groups of 4.
- **Qualifier**: A club that finishes in the top 2 of its group and advances to the R16.
- **R16**: The Round of 16, the first knockout round seeded from 16 group-stage qualifiers (8 matches).
- **SaveSlot**: A localStorage-persisted game state object identified by a unique id.
- **Golden_Boot**: The award for the player with the most goals in a competition over a season.
- **Golden_Glove**: The award for the goalkeeper with the most saves in a competition over a season.
- **OVR**: Overall player rating (integer 62–99).

---

## Requirements

### Requirement 1: Fixtures Screen — League and Tournament Tabs

**User Story:** As a manager, I want to view League and Tournament fixtures on separate tabs in the Fixtures screen, so that I can browse either competition independently and choose any specific match to play or simulate.

#### Acceptance Criteria

1. THE Fixtures_Screen SHALL contain two top-level navigation tabs labelled "League" and "Tournament".
2. WHEN the user selects the "League" tab, THE Fixtures_Screen SHALL display only League_Fixtures grouped by matchday week.
3. WHEN the user selects the "Tournament" tab, THE Fixtures_Screen SHALL display only Tournament_Fixtures grouped by week (group stage) or round (knockout).
4. WHEN a displayed fixture has not been completed and its scheduled week matches the current week, THE Fixtures_Screen SHALL render a "Play" button and a "Quick Sim" button alongside that fixture row.
5. WHEN a displayed fixture has already been completed, THE Fixtures_Screen SHALL still render a "Play" button and a "Quick Sim" button alongside that fixture row, allowing the user to re-simulate or replay the match.
6. WHEN the user clicks "Play" on a fixture row involving the User_Club, THE App SHALL launch the Match_Simulation for that fixture in live broadcast mode.
7. WHEN the user clicks "Play" on a fixture row not involving the User_Club, THE App SHALL launch the Match_Simulation for that fixture in spectator mode.
8. WHEN the user clicks "Quick Sim" on any fixture row, THE App SHALL instantly simulate that fixture and update its result without opening the live Match_Simulation view.
9. THE Fixtures_Screen SHALL display the result (home score – away score) alongside any completed fixture.
10. THE Fixtures_Screen SHALL default to showing the "League" tab on initial load.

---

### Requirement 2: Read-Only Protection for Non-User Matches

**User Story:** As a manager, I want tactical controls to be disabled during matches that do not involve my club, so that I cannot accidentally affect the outcome of simulated matches between other teams.

#### Acceptance Criteria

1. WHEN a Match_Simulation is launched in spectator mode (Non_User_Match), THE Match_Simulation SHALL set the `isSpectating` flag to `true` on the simulation state object.
2. WHILE `isSpectating` is `true`, THE MatchCenter SHALL render the mentality selector in a disabled, non-interactive state.
3. WHILE `isSpectating` is `true`, THE MatchCenter SHALL render the play/pause and step-forward simulation controls as fully functional (spectators may still control playback speed); the step-forward control SHALL function independently of the play/pause state.
4. WHILE `isSpectating` is `true` and the simulation reaches tick 15, THE App SHALL NOT open the Half_Time_Modal.
5. WHILE `isSpectating` is `true` and the simulation reaches tick 15, THE App SHALL automatically resume simulation playback without pausing.
6. IF a Non_User_Match is launched and `isSpectating` is `false`, THEN THE App SHALL correct the flag to `true` before the first tick is processed.

---

### Requirement 3: Half-Time Substitution Panel Improvements

**User Story:** As a manager, I want the half-time substitution panel to show my squad's current stamina, display substitutions visually in real time, allow filtering, and update the lineup display after a substitution is made, so that I can make informed decisions quickly at the interval.

#### Acceptance Criteria

1. WHEN the Half_Time_Modal opens, THE Half_Time_Modal SHALL display every player in the User_Club's squad with their current stamina value (0–100) and position label.
2. WHEN the Half_Time_Modal opens, THE Half_Time_Modal SHALL visually distinguish starting players from bench players (e.g. separate sections or colour coding).
3. THE Half_Time_Modal SHALL provide a filter control that allows the user to filter the displayed player list by position (GK, DEF, MID, ATT) and by stamina threshold (below 70, below 50, all).
4. WHEN the user selects a starting player and a bench player of the same position and confirms the substitution, THE Half_Time_Modal SHALL animate a visual swap (e.g. highlight transition) before committing the change to state.
5. WHEN a substitution is confirmed, THE Half_Time_Modal SHALL update the starting XI and bench sections atomically — both sections SHALL update together; IF either section cannot update, THEN THE Half_Time_Modal SHALL not apply the substitution to either section.
6. WHEN a substitution is confirmed, THE App SHALL update the `isStarting` flag on the swapped players in the `allClubs` state and persist the change via `saveCurrentSlotProgress`.
7. THE Half_Time_Modal SHALL display a running count of substitutions made in the current half-time interval (maximum 3 per match, in line with standard football rules).
8. IF the user attempts a 4th substitution in the same half-time interval, THEN THE Half_Time_Modal SHALL display an error message stating the substitution limit has been reached and SHALL NOT apply the change.
9. WHEN the user clicks "Confirm & Resume", THE Half_Time_Modal SHALL close and THE App SHALL resume Match_Simulation playback from tick 15.

---

### Requirement 4: Transfer Market Expansion

**User Story:** As a manager, I want the transfer market to offer a larger pool of players with better ratings and realistic prices, so that squad-building decisions are more meaningful and rewarding.

#### Acceptance Criteria

1. THE Transfer_Market SHALL generate a minimum of 60 players per scouting refresh.
2. THE Transfer_Market SHALL ensure that at least 30% of generated players have an OVR rating of 83 or above.
3. THE Transfer_Market SHALL ensure that no more than 20% of generated players have an OVR rating below 70.
4. WHEN a player's OVR rating is between 83 and 89, THE Transfer_Market SHALL calculate the player's market value using the existing exponential formula with a multiplier reduced by 35% relative to the current implementation.
5. WHEN a player's OVR rating is 90 or above, THE Transfer_Market SHALL calculate the player's market value using the existing exponential formula with a multiplier reduced by 25% relative to the current implementation.
6. THE Transfer_Market SHALL distribute generated players across all four positions (GK, DEF, MID, ATT) such that no single position exceeds 40% of the total pool and each position has a minimum of 8 players (ensuring all positions are represented for squad-building).
7. WHEN the user clicks "Refresh Scouts", THE Transfer_Market SHALL attempt to generate a new pool of 60 or more players; IF generation fails, THE Transfer_Market SHALL retain the existing player pool and display a notification to the user.

---

### Requirement 5: Season Continuation Data Reset

**User Story:** As a manager, I want all statistics and standings to be fully reset when I start a new season, so that no data from the previous season carries over and the new campaign begins cleanly.

#### Acceptance Criteria

1. WHEN the user initiates a new season (same or different club), THE App SHALL reset every club's `points`, `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `goalDifference`, and `streak` fields to their initial zero/empty values.
2. WHEN the user initiates a new season, THE App SHALL reset every player's `goals`, `assists`, `yellowCards`, `redCards`, `saves`, `tournamentGoals`, `tournamentAssists`, `tournamentYellowCards`, `tournamentRedCards`, and `tournamentSaves` fields to zero.
3. WHEN the user initiates a new season, THE App SHALL reset every player's `matchRatings` array to an empty array.
4. WHEN the user initiates a new season, THE App SHALL regenerate all League_Fixtures and Tournament_Fixtures from scratch using the seeded clubs.
5. WHEN the user initiates a new season, THE App SHALL reset `currentWeek` to 1 and `currentCupRound` to `'Group'`.
6. WHEN the user initiates a new season, THE App SHALL persist the fully-reset SaveSlot to localStorage before rendering the first week of the new campaign.
7. THE App SHALL NOT carry over any group-stage table points, goal tallies, or bracket results from a previous season into a new season.

---

### Requirement 6: Trophies Tab

**User Story:** As a manager, I want a dedicated Trophies tab that records all seasonal award winners across multiple seasons, so that I can track my club's legacy and individual player achievements over time.

#### Acceptance Criteria

1. THE App SHALL include a "Trophies" navigation tab accessible from the main navigation bar.
2. WHEN a season ends, THE App SHALL record the league champion club name and the completed season number in a persistent `trophyHistory` array within the active SaveSlot.
3. WHEN a season ends, THE App SHALL record the tournament (Champions Cup) champion club name and season number in `trophyHistory`.
4. WHEN a season ends, THE App SHALL record the Golden_Boot winner (player name, club name, goal count) for the league competition separately from the tournament competition in `trophyHistory`.
5. WHEN a season ends, THE App SHALL record the Golden_Glove winner (player name, club name, save count) for the league competition separately from the tournament competition in `trophyHistory`.
6. WHEN entries exist in `trophyHistory`, THE Trophies_Tab SHALL display all entries grouped by season number, showing: league champion, tournament champion, league Golden Boot, tournament Golden Boot, league Golden Glove, and tournament Golden Glove.
7. WHEN no trophy entries exist yet, THE Trophies_Tab SHALL display an empty-state message (e.g. "No trophies awarded yet. Complete a season to begin your legacy.") and SHALL NOT render the grouped display structure.
8. THE Trophies_Tab SHALL NOT reset `trophyHistory` during a Season_Reset; it SHALL persist across all seasons.
9. WHERE a season did not produce a tournament champion (e.g. the user's save was created mid-season), THE Trophies_Tab SHALL display "N/A" for the missing award entry.

---

### Requirement 7: Tournament Group-Stage to Knockout Qualification Logic

**User Story:** As a manager, I want the top 2 clubs from each of the 8 groups to correctly qualify for the Round of 16, so that the tournament bracket is populated accurately and the competition is fair.

#### Acceptance Criteria

1. WHEN all three group-stage rounds (Weeks 3, 6, 9) are completed, THE App SHALL compute final group standings for each of the 8 groups using points (win = 3, draw = 1, loss = 0) as the primary sort key, validating that 3 points are awarded for a win, 1 for a draw, and 0 for a loss before selecting qualifiers.
2. WHEN two or more clubs in a group are tied on points, THE App SHALL apply goal difference as the tiebreaker, then goals scored as the secondary tiebreaker.
3. THE App SHALL select exactly the top 2 ranked clubs from each of the 8 groups, producing exactly 16 qualifier club IDs.
4. THE App SHALL seed the 16 qualifiers into the R16 bracket by pairing group winners with runners-up from different groups (Group A winner vs Group B runner-up, Group B winner vs Group A runner-up, continuing for all 8 groups).
5. WHEN `generateCupBracket16FromGroups` is called with the 16 qualifier IDs, THE App SHALL produce exactly 8 R16 bracket nodes, 4 QF nodes, 2 SF nodes, and 1 Final node, totalling 15 nodes.
6. WHEN any group has fewer than 3 completed fixtures (i.e. group stage is incomplete), THE App SHALL NOT attempt to seed the R16 bracket.
7. THE App SHALL store the seeded bracket in the `cupBracket` field of the active SaveSlot and persist it to localStorage.

---

### Requirement 8: README Accuracy Update

**User Story:** As a developer or new contributor, I want the README to accurately describe the current state of Sportsim-Pro, so that I can understand the features, architecture, and how to run the project.

#### Acceptance Criteria

1. THE README SHALL describe the correct technology stack: React 18, TypeScript, Vite, Tailwind CSS, and Lucide icons.
2. THE README SHALL list all major features of the App: dual-campaign gameplay (league + tournament), live match simulation, half-time substitution panel, manager suite (squad, transfers, facilities, boardroom), trophies tab, league table, tournament bracket, analytics center, and save slot system.
3. THE README SHALL include a "Getting Started" section with the exact commands required to install dependencies (`npm install`) and start the development server (`npm run dev`).
4. THE README SHALL document the localStorage save structure at a high level, including the save slot key names (`sportsim_pro_save_slots_v3`, `sportsim_pro_active_slot_id_v3`).
5. THE README SHALL include a project file-structure section that reflects the actual `/src` directory layout (components, data, engine, types).
6. THE README SHALL NOT reference the old plain-JavaScript file structure (`app.js`, `database.js`, `generator.js`) that no longer exists.
7. THE README SHALL describe the 26-week dual-campaign schedule at a high level, including when league matchdays and tournament weeks occur.

---

### Requirement 9: Push Changes to GitHub

**User Story:** As a developer, I want all changes from the season overhaul committed and pushed to the remote GitHub repository, so that the work is version-controlled and accessible to collaborators.

#### Acceptance Criteria

1. WHEN all implementation tasks are complete and the build succeeds with no TypeScript compilation errors, THE developer SHALL stage all modified and new files using `git add`.
2. THE App build (`npm run build`) SHALL produce no TypeScript compilation errors before any commit is created.
3. WHEN all implementation tasks are complete, THE developer SHALL create a single commit with a descriptive message summarising the season-overhaul changes.
4. THE developer SHALL push the commit to the existing remote repository on the current branch using `git push`.
5. IF the remote branch does not yet exist, THEN THE developer SHALL push with `git push -u origin <branch-name>` to set up remote tracking.
