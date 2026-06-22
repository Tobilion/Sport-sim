# ⚽ SportSim Pro

> A browser-based football management simulator built with React 19, TypeScript, and Vite.
> Build your squad, scout global talent, coach your backroom staff, run live match simulations, and dominate the league — all in the browser with no backend required.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Game Systems](#game-systems)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)

---

## Overview

SportSim Pro is a fully client-side football manager inspired by Football Manager, FC Career Mode, and Dream League Soccer. You take control of a club, manage your squad and backroom staff, scout talent across 36 procedurally seeded clubs, and guide your team through a full simulated season — complete with live match events, weather conditions, a league table, cup brackets, and a 3-slot persistent save system.

Every decision matters: tactical formations, focused player coaching, youth academy development, transfer negotiations, and boardroom funding requests all feed into a tick-based simulation engine that plays out in real time.

---

## Features

### Squad & Team Management
- Full 30-player squad roster with interactive starting XI and bench selection
- Visual pitch formation editor with drag-style player swaps
- Filter squad by position, rating, age, fitness, and injury status
- Weekly fatigue and morale tracking per player
- Injury system: minor knocks through serious ligament tears, with duration badges

### Transfer Market
- 25+ senior players, 6+ youth prospects, and 5+ coaches always available
- Three market segments in one view — Senior Players, Youth Academy, Backroom Staff
- **Refresh Agency Targets** button is context-aware per segment:
  - **Senior Players** → higher OVR floor (75–95), younger ages (19–27), plus one exclusive ⭐ **Elite Free Agent**
  - **Youth Prospects** → boosted potential ratings, plus one ✨ **Wonderkid Sensation** (age 15–17, potential 91–96)
  - **Backroom Staff** → higher-rated coaches (78–92), plus one 👑 **Legendary Manager** (rating 89–96)
- Filters: search by name, position, and OVR tier (Bronze / Silver / Gold)
- Manager negotiator skill reduces transfer and hire costs by up to 25%

### Youth Academy
- Up to 16 youth players per club
- Pre-populated at game start with wonderkids (age 15–18, OVR 55–68, potential 70–95)
- Dual stat bars: teal fill = current rating, amber ghost = potential
- Promote to senior squad when ready (respects squad and youth limits)

### Backroom Staff & Coaches
- Up to 8 specialist coaches per club across 9 speciality types
- Each coach applies a weekly development multiplier to the relevant stat categories
- Focus Coaching: assign a coach to up to 6 players for a +50% weekly stat boost
- **Dismiss coaches** at any time — 40% of hire cost refunded to your balance
- Head Coach tactical alignment bonus: +10% to all stat development when mentality matches

### Live Match Simulation
- Tick-by-tick engine (30 ticks = 90 minutes) with a real-time event log
- Formation selector: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2
- Two independent tactical dimensions: **Mentality** (Tiki-Taka, Gegenpressing, Counter-Attack, Park the Bus) + **Playstyle Focus** (Attacking, Balanced, Defending)
- Dynamic weather: Clear, Light Rain, Heavy Rain, Snow, Strong Wind, Extreme Heat, Fog, Thunderstorm — each with real match modifiers (pace, goal probability, card frequency)
- Special match events: Derby atmosphere, Cup Final adrenaline, Relegation six-pointer
- Realistic foul and card logic: location-weighted fouls, player discipline history, suspension bans

### Player Development
- Weekly stat growth per player based on facilities, coaches, and focus assignments
- Dual stat progress bars throughout the UI (current / potential)
- Development log per player: last 5 weeks of stat changes
- Aging system: players grow through youth → peak → veteran stages; retirement probability scales from age 35

### League & Cup
- 36 procedurally seeded clubs across 4 quality tiers
- Full standings with GD, form streaks, and goal tallies
- Cup bracket tournament with knockout simulations
- Season history: final position, top scorer, most appearances, manager rating

### Boardroom
- Request capital injections (approval probability decreases with each subsequent request)
- Facility upgrades: Training Ground, Tactics Centre, Cardio Suite, Medical Wing (Level 1–5)
- Upgrades permanently improve stat growth rate, stamina recovery, and injury healing

### Save System
- 3 named save slots with full game state persistence via `localStorage`
- Auto-saves after every significant action: transfer, match result, season advance

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript 5.8 (strict, no `any`) |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Animation | Motion (Framer Motion) |
| AI Integration | Google Gemini (`@google/genai`) |
| Dev Server | Vite HMR |
| Optional API Server | Express 4 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/your-username/sportsim-pro.git
cd sportsim-pro
npm install
```

### Run in Development

```bash
npm run dev
# Opens on http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```

### Type Check

```bash
npm run lint
```

---

## Project Structure

```
sportsim-pro/
├── public/
│   └── favicon.svg              # Cyan-accented soccer ball SVG favicon
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component — global state, save system, navigation
│   ├── types.ts                 # All shared TypeScript interfaces and enums
│   ├── components/
│   │   ├── ManagerSuite.tsx     # Squad, Transfers, Youth, Development, Coaches, Facilities, Boardroom
│   │   ├── MatchCenter.tsx      # Live match simulation view
│   │   ├── NextMatch.tsx        # Pre-match overview, weather, team selection
│   │   ├── LeagueTable.tsx      # Full standings with form indicators
│   │   ├── AllTeams.tsx         # Browse all 36 clubs
│   │   ├── SquadPitch.tsx       # Visual pitch formation editor
│   │   ├── PlayerDossierModal.tsx   # Full player profile overlay
│   │   ├── ClubDossierModal.tsx     # Club history and stats overlay
│   │   ├── AnalyticsCenter.tsx      # Squad-wide analytics and charts
│   │   ├── SeasonReviewModal.tsx    # End-of-season summary modal
│   │   ├── TrophiesCenter.tsx       # Trophy cabinet
│   │   ├── CupBracket.tsx           # Cup knockout bracket
│   │   ├── PitchCanvas.tsx          # Animated live match pitch
│   │   ├── Sportsbook.tsx           # Match prediction/betting hub
│   │   └── TipstersHub.tsx          # Tips and picks panel
│   ├── data/
│   │   ├── names.ts             # Name pools, club seeding, player/coach generators
│   │   └── campaign.ts          # Campaign state helpers
│   └── engine/
│       └── matchEngine.ts       # Core tick-based match simulation logic
├── index.html                   # Entry HTML — favicon, meta description, theme-color
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Game Systems

### Match Engine

Each tick:
1. Computes effective OVR for both teams (base + morale bonus + fatigue penalty + coach bonus + weather modifier)
2. Determines possession based on tactical matchup and playstyle
3. Rolls for attack chances, shot accuracy, and goal probability
4. Generates fouls weighted by physicality, intensity, and match context
5. Applies card logic: yellow thresholds, second-yellow escalation, straight red for reckless tackles
6. Writes all events to the live event log displayed in real time

### Development Engine

Every simulated week:
1. Each player's stats grow based on: base growth rate, facility level, coach specialty multipliers, and focus coaching bonus (+50%)
2. Fatigue depletes after matches and recovers over the week; players below 30 fatigue face injury rolls
3. Morale shifts from match results, playing time, contract events, and personality traits
4. At season end: all ages advance by 1; retirement probability scales from age 35+

### Transfer Market

Players are procedurally generated using weighted global name pools, position-appropriate stat profiles, and value formulas derived from OVR. The **Refresh Agency Targets** button regenerates the active tab's pool with a quality uplift and always surfaces one special highlighted signing at the top.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

The Gemini API key is used for optional AI-powered features. The game runs fully without it.

---

## Roadmap

- [ ] Stadium management and matchday revenue engine
- [ ] Media / press conference interactions (morale + board confidence effects)
- [ ] Player personality traits and dressing room chemistry system
- [ ] Fog-of-war scouting with scout hiring and progress bars
- [ ] Contract negotiation screen with counter-offers
- [ ] Hall of Fame — legend retirement → specialist coach transition
- [ ] Multi-season career mode with promotion and relegation
- [ ] Mobile-optimised layout
- [ ] PWA offline support

---

*SportSim Pro — Build. Scout. Dominate.*
