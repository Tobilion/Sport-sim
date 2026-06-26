# SportSim Pro — Modular Refactor & Feature Expansion Prompt

## Context

This is a React + TypeScript football manager simulation built with Vite, Tailwind, Redux Toolkit, Recharts, and Lucide icons. The codebase currently works but has a severe modularity problem:

- `src/App.tsx` is **3,909 lines** with **38 useState hooks** and **28 handler functions** all coexisting in a single component. This is the primary issue to solve.
- `src/engine/matchEngine.ts` is 825 lines and mixes commentary strings, simulation logic, odds calculation, and post-match analysis in one file.
- `src/types.ts` is a single flat file with all types.
- `src/data/campaign.ts` mixes fixture generation, club initialization, and season logic.

The goal is a **ground-up modular restructure** of everything that exists, followed by implementing new features — each one also built modularly from the start.

---

## PART 1 — Mandatory Refactor of Existing Code

### Rule: No file should exceed 200 lines. No component should hold state unrelated to its own UI.

---

### 1A. Split `src/types.ts` into a `src/types/` directory

```
src/types/
  index.ts          ← re-exports everything (for backward compat imports)
  player.ts         ← Player, PlayerAttributes, PlayerAmbition, PersonalityTrait
  club.ts           ← Club, TeamMentalityType, PlaystyleType, TeamFormationType
  coach.ts          ← Coach, CoachSpeciality, ManagerSkills
  match.ts          ← Fixture, LiveMatchSimulation, MatchEvent, WeatherCondition, PostMatchAnalysis, GoalReplay, LiveOdds
  cup.ts            ← BracketNode
  transfer.ts       ← TransferPlayer, TransferRumour
  betting.ts        ← BetType, BetSelection, BetTicket, Tipster
  ui.ts             ← NotificationItem, MoraleEvent, MoraleEventOption, NewsItem
  season.ts         ← SeasonAward, TrophyRecord, CampaignState
```

`src/types/index.ts` must re-export every named export from every sub-file so existing imports (`from "../types"`) continue to work unchanged.

---

### 1B. Split `src/engine/matchEngine.ts` into a `src/engine/` directory

```
src/engine/
  index.ts                  ← re-exports all public functions
  matchEngine/
    commentary.ts           ← All string arrays: DEF_TO_MID_PASSES, SHOT_SAVES, GOAL_CELEBRATIONS, FOULS_AND_CARDS, etc.
    physics.ts              ← Ball movement, zone transitions, possession logic, weather modifiers
    events.ts               ← Event generation: goals, shots, fouls, cards, half-time, full-time
    ratings.ts              ← Player ratings calculation, MOTM logic, post-match ratings
    odds.ts                 ← calculateLiveOdds(), fixture odds generation
    init.ts                 ← initLiveMatch()
    tick.ts                 ← progressMatchTick() — imports from physics, events, commentary
    postMatch.ts            ← buildPostMatchAnalysis()
  weeklyDevelopment.ts      ← (keep as-is for now, refactor only if >200 lines)
```

---

### 1C. Split `src/data/campaign.ts` into a `src/data/` directory

```
src/data/
  campaign/
    index.ts              ← re-exports
    clubFactory.ts        ← Club generation, starting squads, initial stats
    fixtureGenerator.ts   ← Round-robin league schedule generation
    cupGenerator.ts       ← Cup bracket initialization (32 teams)
    seasonReset.ts        ← End-of-season reset logic: promotion, relegation, trophy archiving
    youthGraduation.ts    ← processYouthGraduation()
  transferMarket.ts       ← (keep, already reasonable at 214 lines)
  names.ts                ← (keep)
```

---

### 1D. Decompose `src/App.tsx` — the most critical task

`App.tsx` must be reduced to **under 150 lines**. It should only:
1. Render the top-level layout shell (nav, header, tab router)
2. Compose context providers
3. Import the active tab's page component

#### Step 1 — Extract all state into a Redux slice or custom hooks

Create `src/store/` with Redux Toolkit slices. Each slice manages its own state and reducers:

```
src/store/
  index.ts                  ← configureStore(), export RootState, AppDispatch
  slices/
    campaignSlice.ts        ← userClubId, userBalance, currentWeek, campaignType, allClubs, leagueFixtures, tournamentFixtures, cupBracket, currentCupRound, historyTrophies, managerSkills, newsFeed
    simulationSlice.ts      ← activeSimulation, isPlaying, simSpeed, simMessage
    uiSlice.ts              ← currentTabProgress, fixturesActiveSubTab, activePlayerDossierId, activeClubDossierId, dossierTypeTab, isNotificationDrawerOpen, isSeasonReviewOpen, isHalftimeModalOpen, notifications, postMatchAnalysis, pendingMoraleEvents, consecutiveLosses, showPressureModal
    saveSlice.ts            ← saveSlots, activeSlotId, newManagerName, newSelectedClubId, newCampaignType, isCreatingNewSlot, saveToDelete
```

If you prefer custom hooks over Redux, organise them as:

```
src/hooks/
  useCampaign.ts        ← all campaign state + mutations
  useSimulation.ts      ← live match state + tick logic
  useNotifications.ts   ← notification queue
  useSaveSlots.ts       ← save/load/delete slot logic
  useUI.ts              ← tab routing, modal state
```

Either approach is acceptable, but **do not mix both** — pick one pattern and use it everywhere.

#### Step 2 — Extract handler functions into service files

Move all `handle*` functions out of App.tsx into dedicated service modules. Each file owns a single domain:

```
src/services/
  transferService.ts      ← handleBuyPlayer, handleSellPlayer, handleBuyCoach, handleDismissCoach, handleTakeoverClub
  youthService.ts         ← handleSellYouth, handlePromoteYouth, handleSignYouthToAcademy
  trainingService.ts      ← handleTogglePlayerFocus, handleAssignCoachToPlayer
  tacticsService.ts       ← handleTacticalShift, handleFormationShift, handlePlaystyleShift
  facilityService.ts      ← handleUpgradeFacilities
  simulationService.ts    ← handleInitiateLiveSimulation, handleProgressSimOneTick, handleFinalizeAndSettleMatch, handleSkipOrQuickSim, handleQuickSimulateMatch
  seasonService.ts        ← end-of-season logic, trophy archiving, weekly progression, morale events, news generation
  saveService.ts          ← handleCreateSaveSlot, handleHardReset, load/save to localStorage
```

Each service function receives what it needs as parameters (state slices, dispatch, club data) and returns updated state. **No service file imports React.** Services are pure functions or thin wrappers.

#### Step 3 — Extract each tab into a page component

```
src/pages/
  ManagerPage.tsx         ← wraps <ManagerSuite>
  NextMatchPage.tsx       ← wraps <NextMatch>
  FixturesPage.tsx        ← league/tournament sub-tab switcher + <MatchCenter> + <CupBracket>
  StandingsPage.tsx       ← wraps <LeagueTable>
  AnalyticsPage.tsx       ← wraps <AnalyticsCenter>
  NewsPage.tsx            ← news feed UI (extracted from App.tsx inline JSX)
  AllTeamsPage.tsx        ← wraps <AllTeams>
  TrophiesPage.tsx        ← wraps <TrophiesCenter>
  SportsbookPage.tsx      ← wraps <Sportsbook> + <TipstersHub>
```

Each page component imports its own slice of state from the store/hooks and dispatches its own actions. **No prop drilling from App.tsx into pages.**

#### Step 4 — Final App.tsx shape (target: <150 lines)

```tsx
// src/App.tsx
export default function App() {
  const { currentTab } = useUI();
  const { activeSlotId } = useSaveSlots();

  if (!activeSlotId) return <SaveSlotScreen />;

  return (
    <div className="...layout shell...">
      <TopBar />
      <MainContent currentTab={currentTab} />
      <BottomNav />
      <GlobalModals />   {/* PostMatchModal, MoraleEventModal, SeasonReviewModal, NotificationDrawer */}
    </div>
  );
}
```

---

### 1E. Component file rules

Each component in `src/components/` must:
- Have **one responsibility**
- Not exceed **300 lines** (split into sub-components if larger)
- Own only UI state (open/closed dropdowns, local form input) — all domain state comes from the store/hooks
- Be accompanied by a `src/components/ComponentName/` folder if it has sub-components

---

## PART 2 — New Features (each built modularly from day one)

Each new feature follows this structure:
```
src/features/<feature-name>/
  types.ts          ← feature-specific types (extends global types if needed)
  store.ts          ← Redux slice OR custom hook for this feature's state
  service.ts        ← pure logic functions (no React imports)
  components/       ← UI components for this feature
    index.ts        ← barrel export
  index.ts          ← public API of the feature
```

The feature's `index.ts` is the **only** file that other parts of the app import from. Internal structure is private to the feature.

---

### Feature 1: Transfer Market Window

**Files:**
```
src/features/transfer-market/
  types.ts            ← TransferOffer, ContractTerms, BidStatus ('pending'|'accepted'|'rejected')
  service.ts          ← generateOffer(), evaluateBid(), applyTransfer(), calculateWageImpact()
  store.ts            ← transferWindowSlice: openOffers, recentDeals, marketPool (refreshed weekly)
  components/
    TransferMarketPage.tsx      ← main layout with tabs
    MarketPlayerCard.tsx        ← single player card with stats + bid button
    BidModal.tsx                ← offer amount + wage + contract length form
    ActiveOffersList.tsx        ← pending bids, accepted/rejected status
    RecentDealsLog.tsx          ← completed transfers this season
    WageBudgetBar.tsx           ← visual wage bill usage
  index.ts
```

**Behaviour:**
- Transfer window is open in weeks 1–4 and weeks 20–24; closed otherwise (show countdown)
- Bidding on a player triggers an AI acceptance check: `playerRating × reputationGap × personalityModifier`
- Rejected bids can be re-raised once per week
- Wage budget bar updates live as offers are accepted
- Free agents (no club) can be signed any week for just wages

---

### Feature 2: Contract System

**Files:**
```
src/features/contracts/
  types.ts            ← PlayerContract { playerId, weeksRemaining, weeklyWage, expiryWarningIssued }
  service.ts          ← tickContracts(), generateRenewalDemand(), applyContractRenewal(), handleExpiry()
  store.ts            ← contractsSlice: contracts map, expiredThisSeason[]
  components/
    ContractPanel.tsx           ← shown inside PlayerDossierModal as a new tab
    RenewalModal.tsx            ← player demands wage + length, manager counters
    ExpiryWarningBanner.tsx     ← top-of-screen alert when <4 weeks left
    ContractListView.tsx        ← full squad contract overview (in ManagerSuite)
  index.ts
```

**Behaviour:**
- Every player starts with a randomised contract of 52–156 weeks (1–3 seasons)
- At <8 weeks remaining, the player's personality drives their demand: Mercenary asks 3× market rate, Loyal accepts 0.8×, Ambitious demands performance clauses
- Refusing renewal for 2 consecutive weeks causes the player to go on the transfer market automatically
- Expired contracts: player leaves for free at season end (logged in notification + news feed)

---

### Feature 3: Financial Dashboard

**Files:**
```
src/features/finances/
  types.ts            ← FinancialRecord { week, income: FinancialItem[], expenses: FinancialItem[] }, FinancialItem { label, amount, category }
  service.ts          ← recordTransaction(), computeWeeklyWageBill(), computePrizeMoney(), generateFinancialSummary()
  store.ts            ← financesSlice: ledger FinancialRecord[], season totals
  components/
    FinanceDashboard.tsx        ← page layout with 4 panels
    IncomeBreakdown.tsx         ← prize money, transfer fees received, gate receipts (Recharts bar)
    ExpenseBreakdown.tsx        ← wages, transfer fees paid, facility upgrades (Recharts bar)
    CashflowChart.tsx           ← cumulative balance over the season (Recharts area chart)
    WageBillTable.tsx           ← sortable table: player, position, wage, contract weeks left
  index.ts
```

**Behaviour:**
- Every match played adds gate receipt income (scales with league position × stadium tier)
- Each week, wages are auto-debited; if balance < 0 the board issues a warning
- Transfer fees, facility upgrades, and youth signings all create ledger entries
- Season summary shows profit/loss; affects board confidence going into next season

---

### Feature 4: Board Objectives System

**Files:**
```
src/features/board-objectives/
  types.ts            ← BoardObjective { id, description, type, target, current, deadline: week, reward, status }
                         ObjectiveType: 'league_position' | 'cup_round' | 'budget_balance' | 'youth_promoted' | 'win_streak'
  service.ts          ← generateSeasonObjectives(), evaluateObjectives(), applyObjectiveOutcome()
  store.ts            ← boardSlice: objectives[], boardConfidence (0–100), consecutiveMissedObjectives
  components/
    BoardObjectivesPanel.tsx    ← card list of active objectives with progress bars
    ObjectiveCard.tsx           ← single objective: description, progress, deadline, reward
    BoardConfidenceBar.tsx      ← visual 0–100 confidence meter with risk zone indicator
    BoardMessageModal.tsx       ← formal board communiqué at season start/end
  index.ts
```

**Behaviour:**
- 3–5 objectives generated at season start based on league position and manager level
- Each objective has a week deadline (not just end-of-season) — e.g. "Top 6 by Week 20"
- Completion rewards: cash injection, skill point, or transfer budget increase
- Failure penalty: board confidence -20; at 0 confidence the manager gets sacked (game over / new save prompt)
- Board confidence also affected by: consecutive losses (-10), big wins (+5), trophy won (+30)

---

### Feature 5: Press Conference Room

**Files:**
```
src/features/press-conference/
  types.ts            ← PressQuestion { id, context, prompt, options: PressAnswer[] }
                         PressAnswer { label, moraleEffect, confidenceEffect, pressRecoveryPoints }
                         PressContext: 'post_win' | 'post_loss' | 'pre_derby' | 'transfer_rumour' | 'injury_crisis' | 'board_pressure'
  service.ts          ← generatePressQuestions(), applyPressOutcome(), selectQuestionForContext()
  store.ts            ← pressSlice: pendingConference PressQuestion | null, conferenceHistory[]
  components/
    PressConferenceModal.tsx    ← full-screen modal, triggered after key matches
    QuestionCard.tsx            ← journalist avatar + question text
    AnswerOptions.tsx           ← 3 response buttons with tone labels (e.g. "Confident", "Cautious", "Deflect")
    PressOutcomeBanner.tsx      ← shows morale/confidence effect after selection
  index.ts
```

**Behaviour:**
- Triggered automatically after: any loss, a 5+ goal win, a cup exit, a board pressure event
- 3 questions per conference, each with 3 answers of different risk/reward profiles
- "Confident" answers boost team morale but reduce board confidence if results don't follow
- "Deflect" answers have no effect but prevent negative outcomes
- Answers referencing specific players by name boost that player's morale +5

---

### Feature 6: International Breaks

**Files:**
```
src/features/international-break/
  types.ts            ← InternationalBreak { week, calledUpPlayerIds: string[], returnWeek }
                         NationalTeamResult { playerName, goals, assists, injured: boolean }
  service.ts          ← scheduleInternationalBreaks(), selectCalledUpPlayers(), simulateInternationalDuty(), applyReturnEffects()
  store.ts            ← internationalSlice: breaks InternationalBreak[], currentBreak | null
  components/
    InternationalBreakModal.tsx     ← announced at start of break week
    CallUpList.tsx                  ← list of players selected with their national teams
    DutyResultCard.tsx              ← each player's international result + injury/form effect
    BreakCountdown.tsx              ← shown in NextMatch tab when break is active
  index.ts
```

**Behaviour:**
- Breaks occur on weeks 10, 22, and 34 (configurable)
- Top-rated players (rating > 72) from any club are eligible; user's players included
- Each called-up player plays 0–2 international matches: goals/assists recorded, 12% injury risk per game
- Players return with: fatigue +20 if played, morale +10 if team won, formStreak +1 if scored
- User cannot play league/cup fixtures during a break week — sub-tab shows break UI instead

---

### Feature 7: Set Piece Designer

**Files:**
```
src/features/set-pieces/
  types.ts            ← SetPieceRoutine { id, name, type: 'corner'|'freekick', taker: string, runners: string[], zone: 'near'|'far'|'penalty_spot', style: 'cross'|'short'|'direct' }
  service.ts          ← applySetPieceBonus(), evaluateRoutineEffectiveness(), getSetPieceCoachBonus()
  store.ts            ← setPiecesSlice: cornerRoutine, freeKickRoutine
  components/
    SetPieceDesigner.tsx          ← full designer layout (tab inside ManagerSuite or own page)
    PitchSetPieceCanvas.tsx       ← SVG pitch showing runner arrows and zones (reuse PitchCanvas primitives)
    RoutineSelector.tsx           ← dropdown to load/save named routines
    PlayerRoleAssigner.tsx        ← assign taker + up to 3 runners from squad list
    SetPieceSummary.tsx           ← effectiveness score based on taker skill + Set Pieces Coach rating
  index.ts
```

**Behaviour:**
- Routine is applied in matchEngine when a foul is awarded in dangerous positions
- Effectiveness = (taker.attributes.passing × 0.4) + (runner avg rating × 0.3) + (setPiecesCoach.rating × 0.3)
- Score > 75 → 2× goal probability on that event tick
- No coach assigned → 0.5× multiplier instead (penalty for ignoring it)

---

### Feature 8: Hall of Fame & Player Retirement

**Files:**
```
src/features/hall-of-fame/
  types.ts            ← HallOfFameMember { playerId, name, club, seasons, goals, assists, avgRating, trophies, retiredWeek }
                         RetirementEvent { player, season, reason: 'age'|'rating_decline'|'voluntary' }
  service.ts          ← checkRetirementEligibility(), processRetirement(), induceToHallOfFame()
  store.ts            ← hallOfFameSlice: members[], retirementQueue RetirementEvent[]
  components/
    HallOfFamePage.tsx            ← gallery layout, sortable by goals/trophies/rating
    HallOfFameMemberCard.tsx      ← portrait card with career stats + club badge
    RetirementModal.tsx           ← emotional farewell modal with career highlights
    LegendsBanner.tsx             ← top-3 all-time scorers shown in StandingsPage header
  index.ts
```

**Behaviour:**
- Retirement triggered when: age ≥ 37, OR rating < 55 AND age > 32, OR player explicitly retires (via dossier option)
- Career stats aggregated from all seasons (goals, assists, appearances, matchRatings avg, trophies won)
- Retirement triggers farewell modal with auto-generated biography highlight
- Hall of Fame tab accessible from TrophiesCenter
- User players who retire are immortalised with club badge of their final club

---

## PART 3 — Cross-Cutting Engineering Rules

These rules apply to **all** code, existing and new:

1. **No file over 200 lines** (components: 300 line max if JSX-heavy). Split ruthlessly.
2. **No React import in service files.** Services are pure TypeScript functions.
3. **No inline business logic in JSX.** All calculations happen in services or selectors; JSX only renders.
4. **Barrel exports everywhere.** Every folder has an `index.ts` that exports its public API. Consumers import from the folder, not from internal files.
5. **Feature isolation.** Features do not import from each other's internal files. Cross-feature communication happens via the shared store only.
6. **Types colocation.** Types that are only used inside one feature live in that feature's `types.ts`. Types shared across 3+ features live in `src/types/`.
7. **No `any`.** All TypeScript must be strictly typed. Use `unknown` + type guards when necessary.
8. **Consistent naming:**
   - Files: `camelCase.ts` for logic, `PascalCase.tsx` for components
   - Hooks: always prefix `use`
   - Services: always suffix `Service` (file name) or action verb (function name)
   - Slices: always suffix `Slice`
9. **One concern per hook.** `useSimulation` only touches simulation state. Don't bundle unrelated state into one hook for convenience.
10. **Comments on WHY, not WHAT.** Code should be self-documenting. Comments explain non-obvious decisions or constraints, not what the line does.

---

## Execution Order

Refactor and build in this order to avoid breaking the app at any step:

1. Split `src/types.ts` → `src/types/` (no logic changes, safe)
2. Split `src/engine/matchEngine.ts` → `src/engine/matchEngine/` (no logic changes, safe)
3. Split `src/data/campaign.ts` → `src/data/campaign/` (no logic changes, safe)
4. Create store slices and wire up Redux Provider in `src/main.tsx`
5. Migrate state from App.tsx into slices one group at a time, testing after each group
6. Extract handler functions into service files, importing from slices
7. Extract pages into `src/pages/`, each pulling from the store
8. Slim App.tsx down to the shell
9. Build Feature 2 (Contracts) — small, foundational, affects existing player data
10. Build Feature 3 (Finances) — integrates with transfer + facilities handlers already extracted
11. Build Feature 4 (Board Objectives) — pure addition, no existing code touched
12. Build Feature 1 (Transfer Market UI) — uses already-extracted transferService + marketPool
13. Build Feature 5 (Press Conference) — pure addition
14. Build Feature 6 (International Breaks) — hooks into week progression in seasonService
15. Build Feature 7 (Set Piece Designer) — hooks into matchEngine tick
16. Build Feature 8 (Hall of Fame) — hooks into seasonService end-of-season reset

Do not move to the next step until the app builds and runs correctly at the current step.
