import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Tv,
  Calendar,
  UserCheck,
  TrendingUp,
  Users,
  Wallet,
  Briefcase,
  AlertCircle,
  Play,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
  Trash2,
  PlusCircle,
  FileText,
  User,
  Activity,
  Heart,
  ChevronRight,
  ShieldAlert,
  Dumbbell,
  Zap,
  BarChart3,
  Globe,
  Landmark,
  Shield,
  Search,
  BookOpen,
  MapPin,
  Info,
  Bell,
  Home,
  MoreHorizontal,
} from "lucide-react";

import {
  Club,
  Player,
  Fixture,
  BracketNode,
  LiveMatchSimulation,
  TeamMentalityType,
  TrophyRecord,
  ManagerSkills,
  NewsItem,
  Coach,
  TeamFormationType,
  PlaystyleType,
  WeatherCondition,
  NotificationItem,
  PostMatchAnalysis,
} from "./types";

import {
  seedAllClubs,
  randRange,
  generatePlayerAttributes,
  generateWonderkid,
} from "./data/names";
import {
  calculatePreMatchOdds,
  simulateTick as simulateMatchTick,
  runAssistantSubstitution,
  quickSimulateFixture,
  generatePostMatchAnalysis,
} from "./engine/matchEngine";
import {
  processWeeklyDevelopment,
  processYouthGraduation,
} from "./engine/weeklyDevelopment";
import {
  getTransferMarketPool,
  getYouthMarketPool,
  getHireableCoaches,
  generateStartingYouthAcademy,
} from "./data/transferMarket";

import { MatchCenter } from "./components/MatchCenter";
import { LeagueTable } from "./components/LeagueTable";
import { CupBracket } from "./components/CupBracket";
import { ManagerSuite } from "./components/ManagerSuite";
import { PlayerDossierModal } from "./components/PlayerDossierModal";
import { MoraleEventModal } from "./components/MoraleEventModal";
import { ClubDossierModal } from "./components/ClubDossierModal";
import { SeasonReviewModal } from "./components/SeasonReviewModal";
import { NextMatch } from "./components/NextMatch";
import { AnalyticsCenter } from "./components/AnalyticsCenter";
import { AllTeams } from "./components/AllTeams";
import { TrophiesCenter } from "./components/TrophiesCenter";
import { PostMatchModal } from "./components/PostMatchModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { AppNav } from "./components/AppNav";
import { AppHeader } from "./components/AppHeader";
import { MobileNav } from "./components/MobileNav";
import { HalftimeModal } from "./components/modals/HalftimeModal";
import { PressureModal } from "./components/modals/PressureModal";
import { FixturesPage } from "./pages/FixturesPage";
import { NewsPage } from "./pages/NewsPage";
import { DUAL_SCHEDULE } from "./data/schedule";
import { TransferMarketWindow } from "./features/transfer-market";
import { BoardObjectives } from "./features/board-objectives";
import { FinancialDashboard } from "./features/finances";
import type { TransferMarketState } from "./features/transfer-market";
import type { BoardState } from "./features/board-objectives";
import type { FinancialEntry } from "./features/finances";
import {
  EMPTY_TRANSFER_STATE,
  generateIncomingBids,
  makeHistoryEntry,
  purgeStaleBids,
  getTransferWindowPhase,
} from "./features/transfer-market";
import {
  INITIAL_BOARD_STATE,
  generateSeasonObjectives,
  refreshObjectiveProgress,
  evalObjectivesForConfidence,
  adjustConfidence,
} from "./features/board-objectives";
import {
  buildWeeklyWageEntry,
  buildMatchdayEntry,
  buildTransferInEntry,
  buildTransferOutEntry,
  buildFacilityEntry,
  buildLeaguePrizeEntry,
  buildCupPrizeEntry,
  buildObjectiveBonusEntry,
} from "./features/finances";

interface SaveSlot {
  id: string;
  managerName: string;
  clubId: string;
  campaignType: "league" | "cup" | "dual";
  currentWeek: number;
  userBalance: number;
  allClubs: Club[];
  leagueFixtures: Fixture[];
  tournamentFixtures?: Fixture[];
  cupBracket: BracketNode[];
  currentCupRound: "Group" | "R16" | "QF" | "SF" | "F" | "FINISHED" | "R32";
  createdTime: number;
  lastPlayed: number;
  historyTrophies?: TrophyRecord[];
  managerSkills: ManagerSkills;
  newsFeed: NewsItem[];
}

// Fixed constant for starting budget
const START_BUDGET = 2_000_000_000;

// Prize money per finishing position (20-team league)
const LEAGUE_PRIZE_MONEY = [
  5000000, 3500000, 2500000, 1800000, 1200000, 900000, 700000, 500000,
  400000, 300000, 200000, 150000, 100000, 75000, 50000, 40000, 30000, 20000, 15000, 10000,
];

// Dynamic round-robin Berger generator for 20 teams (19 rounds)
function generateLeagueFixtures20(clubIds: string[]): Fixture[] {
  const numTeams = clubIds.length;
  const fixtures: Fixture[] = [];
  const teams = [...clubIds];
  let fixtureIdCounter = 1;

  for (let round = 1; round < numTeams; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];
      const isHome = round % 2 === 0;

      fixtures.push({
        id: `fix-${fixtureIdCounter++}`,
        week: round,
        homeClubId: isHome ? home : away,
        awayClubId: isHome ? away : home,
        isCompleted: false,
        weather: generateWeather(),
      });
    }

    // Rotate teams
    const rest = teams.slice(1);
    const last = rest.pop();
    if (last !== undefined) {
      teams.splice(1, teams.length - 1, last, ...rest);
    }
  }
  return fixtures;
}


import {
  getTeamGroup,
  generateWeather,
  generateTournamentGroupFixtures,
  generateCupBracket16FromGroups,
  getGroupStandingsForGroup,
} from './data/tournamentUtils';

export default function App() {
  // Synchronous loading helper on initial mount to prevent empty state render crash
  const getInitialSlotData = (): SaveSlot | null => {
    try {
      const activeId = localStorage.getItem("sportsim_pro_active_slot_id_v3");
      if (!activeId) return null;
      const saved = localStorage.getItem("sportsim_pro_save_slots_v3");
      if (!saved) return null;
      const slots: SaveSlot[] = JSON.parse(saved);
      return slots.find((s: SaveSlot) => s.id === activeId) || null;
    } catch {
      return null;
    }
  };

  const initialSlot = getInitialSlotData();

  // Save slots list
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>(() => {
    try {
      const saved = localStorage.getItem("sportsim_pro_save_slots_v3");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Save Slot ID
  const [activeSlotId, setActiveSlotId] = useState<string | null>(() => {
    const active = localStorage.getItem("sportsim_pro_active_slot_id_v3");
    return active || null;
  });

  // Current session game state variables
  const [managerName, setManagerName] = useState<string>(
    () => initialSlot?.managerName || "Alex Ferguson",
  );
  const [userClubId, setUserClubId] = useState<string>(
    () => initialSlot?.clubId || "club-1",
  );
  const [campaignType, setCampaignType] = useState<"league" | "cup" | "dual">(
    () => "dual",
  ); // Force dual for pristine cross-league action
  const [currentWeek, setCurrentWeek] = useState<number>(
    () => initialSlot?.currentWeek || 1,
  );
  const [userBalance, setUserBalance] = useState<number>(
    () => initialSlot?.userBalance ?? START_BUDGET,
  );
  const [allClubs, setAllClubs] = useState<Club[]>(
    () => initialSlot?.allClubs || [],
  );
  const [leagueFixtures, setLeagueFixtures] = useState<Fixture[]>(
    () => initialSlot?.leagueFixtures || [],
  );
  const [tournamentFixtures, setTournamentFixtures] = useState<Fixture[]>(
    () => initialSlot?.tournamentFixtures || [],
  );
  const [cupBracket, setCupBracket] = useState<BracketNode[]>(
    () => initialSlot?.cupBracket || [],
  );
  const [currentCupRound, setCurrentCupRound] = useState<
    "Group" | "R16" | "QF" | "SF" | "F" | "FINISHED"
  >(() => (initialSlot?.currentCupRound || "Group") as any);
  const [historyTrophies, setHistoryTrophies] = useState<TrophyRecord[]>(
    () => initialSlot?.historyTrophies || [],
  );
  const [managerSkills, setManagerSkills] = useState<ManagerSkills>(
    () =>
      initialSlot?.managerSkills || {
        xp: 0,
        level: 1,
        skillPoints: 0,
        tacticalMastermind: 0,
        negotiator: 0,
        youthDevelopment: 0,
      },
  );
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>(
    () => initialSlot?.newsFeed || [],
  );
  const [currentTabProgress, setCurrentTabProgress] = useState<
    | "MANAGER"
    | "NEXT_MATCH"
    | "FIXTURES"
    | "STANDINGS"
    | "ANALYTICS"
    | "ALL_TEAMS"
    | "TROPHIES"
    | "LEADERS"
    | "NEWS"
    | "BOARD"
    | "FINANCES"
  >("MANAGER");
  const [fixturesActiveSubTab, setFixturesActiveSubTab] = useState<
    "LEAGUE" | "TOURNAMENT"
  >("LEAGUE");
  const [financesSubTab, setFinancesSubTab] = useState<'overview' | 'transfers'>('overview');

  // Dossier details modal anchors
  const [activePlayerDossierId, setActivePlayerDossierId] = useState<
    string | null
  >(null);
  const [activeClubDossierId, setActiveClubDossierId] = useState<string | null>(
    null,
  );

  // Player Dossier Tab selection
  const [dossierTypeTab, setDossierTypeTab] = useState<"STATS" | "QUALITIES">(
    "STATS",
  );

  // Interactive line-up substitutions midpoint check
  const [isHalftimeModalOpen, setIsHalftimeModalOpen] =
    useState<boolean>(false);

  // Season completion review screen
  const [isSeasonReviewOpen, setIsSeasonReviewOpen] = useState<boolean>(false);

  // Save creation states
  const [newManagerName, setNewManagerName] = useState<string>("");
  const [newSelectedClubId, setNewSelectedClubId] = useState<string>("club-1");
  const [newCampaignType, setNewCampaignType] = useState<
    "league" | "cup" | "dual"
  >("dual");
  const [isCreatingNewSlot, setIsCreatingNewSlot] = useState<boolean>(false);
  const [saveToDelete, setSaveToDelete] = useState<string | null>(null);

  // Simulation parameters
  const [activeSimulation, setActiveSimulation] =
    useState<LiveMatchSimulation | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1000); // ms per tick
  const [simMessage, setSimMessage] = useState<string>("");

  // v2: Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // v2: Post-match analysis modal
  const [postMatchAnalysis, setPostMatchAnalysis] = useState<PostMatchAnalysis | null>(null);

  // Morale event queue — shown one at a time after weekly advance
  const [pendingMoraleEvents, setPendingMoraleEvents] = useState<import("./types").Player[]>([]);

  // v2: Media pressure (consecutive losses)
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [showPressureModal, setShowPressureModal] = useState<boolean>(false);

  // ── Feature: Transfer Market Window ────────────────────────────────────────
  const [transferMarketState, setTransferMarketState] = useState<TransferMarketState>(EMPTY_TRANSFER_STATE);

  // ── Feature: Board Objectives ───────────────────────────────────────────────
  const [boardState, setBoardState] = useState<BoardState>(INITIAL_BOARD_STATE);

  // ── Feature: Financial Ledger ───────────────────────────────────────────────
  const [financialLedger, setFinancialLedger] = useState<FinancialEntry[]>([]);
  const addFinancialEntry = (entry: FinancialEntry) =>
    setFinancialLedger(prev => [...prev, entry]);

  const simRef = useRef<any>(null);

  // v2: Add a notification helper
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 30));
  };

  // Sync slots to localstorage
  useEffect(() => {
    localStorage.setItem(
      "sportsim_pro_save_slots_v3",
      JSON.stringify(saveSlots),
    );
  }, [saveSlots]);

  // Sync active slot ID to localstorage
  useEffect(() => {
    if (activeSlotId) {
      localStorage.setItem("sportsim_pro_active_slot_id_v3", activeSlotId);
    } else {
      localStorage.removeItem("sportsim_pro_active_slot_id_v3");
    }
  }, [activeSlotId]);

  // Automatically load the active slot when selected
  useEffect(() => {
    if (activeSlotId) {
      const slot = saveSlots.find((s) => s.id === activeSlotId);
      if (slot) {
        setManagerName(slot.managerName);
        setUserClubId(slot.clubId);
        setCampaignType(slot.campaignType);
        setCurrentWeek(slot.currentWeek);
        setUserBalance(slot.userBalance);
        setAllClubs(slot.allClubs);
        setLeagueFixtures(slot.leagueFixtures);
        setTournamentFixtures(slot.tournamentFixtures || []);
        setCupBracket(slot.cupBracket);
        setCurrentCupRound(slot.currentCupRound as any);
        setHistoryTrophies(slot.historyTrophies || []);
        setManagerSkills(
          slot.managerSkills || {
            xp: 0,
            level: 1,
            skillPoints: 0,
            tacticalMastermind: 0,
            negotiator: 0,
            youthDevelopment: 0,
          },
        );
        setNewsFeed(slot.newsFeed || []);
      }
    }
  }, [activeSlotId]);

  // Sync fixturesActiveSubTab to currentWeek's type when currentWeek changes
  useEffect(() => {
    const weekInfo = DUAL_SCHEDULE.find((s) => s.week === currentWeek);
    const isLeagueMatch = weekInfo ? weekInfo.type === "league" : true;
    setFixturesActiveSubTab(isLeagueMatch ? "LEAGUE" : "TOURNAMENT");
  }, [currentWeek]);

  // Update current active Slot state payload in memory & persist
  const saveCurrentSlotProgress = (
    updatedClubs?: Club[],
    updatedFixtures?: Fixture[],
    updatedBracket?: BracketNode[],
    updatedWeek?: number,
    updatedRound?: "Group" | "R16" | "QF" | "SF" | "F" | "FINISHED" | "R32",
    updatedBalance?: number,
    updatedTournamentFixtures?: Fixture[],
    updatedHistoryTrophies?: TrophyRecord[],
    updatedManagerSkills?: ManagerSkills,
    updatedNewsFeed?: NewsItem[],
  ) => {
    if (!activeSlotId) return;

    setSaveSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === activeSlotId) {
          return {
            ...slot,
            currentWeek: updatedWeek !== undefined ? updatedWeek : currentWeek,
            userBalance:
              updatedBalance !== undefined ? updatedBalance : userBalance,
            allClubs: updatedClubs !== undefined ? updatedClubs : allClubs,
            leagueFixtures:
              updatedFixtures !== undefined ? updatedFixtures : leagueFixtures,
            tournamentFixtures:
              updatedTournamentFixtures !== undefined
                ? updatedTournamentFixtures
                : slot.tournamentFixtures || tournamentFixtures,
            cupBracket:
              updatedBracket !== undefined ? updatedBracket : cupBracket,
            currentCupRound: (updatedRound !== undefined
              ? updatedRound
              : currentCupRound) as any,
            historyTrophies:
              updatedHistoryTrophies !== undefined
                ? updatedHistoryTrophies
                : historyTrophies,
            managerSkills:
              updatedManagerSkills !== undefined
                ? updatedManagerSkills
                : managerSkills,
            newsFeed:
              updatedNewsFeed !== undefined ? updatedNewsFeed : newsFeed,
            lastPlayed: Date.now(),
          };
        }
        return slot;
      }),
    );
  };

  // Create & Register a Brand New Save Career Slot
  const handleCreateSaveSlot = () => {
    if (!newManagerName.trim()) {
      setSimMessage("Please provide a valid Manager Name/Surname to start.");
      setTimeout(() => setSimMessage(""), 3000);
      return;
    }

    const clubsSeeded = seedAllClubs();
    // Prioritize user-selected club to index 0 so they participate in both SuperLeague and group stage Group A
    const selectedIdx = clubsSeeded.findIndex(
      (c) => c.id === newSelectedClubId,
    );
    if (selectedIdx !== -1 && selectedIdx !== 0) {
      const temp = clubsSeeded[0];
      clubsSeeded[0] = clubsSeeded[selectedIdx];
      clubsSeeded[selectedIdx] = temp;
    }

    const teamIds = clubsSeeded.map((c) => c.id);
    const leagueClubs = teamIds.slice(0, 20); // 20 teams playing in Elite League

    const fixturesGen = generateLeagueFixtures20(leagueClubs);
    const tournamentFixturesGen = generateTournamentGroupFixtures(clubsSeeded); // 32 teams group fixtures (Groups A-H)
    const bracketGen: BracketNode[] = []; // empty at first, seeded after Week 9

    const newSlot: SaveSlot = {
      id: `slot-${Date.now()}-${randRange(100, 999)}`,
      managerName: newManagerName,
      clubId: newSelectedClubId,
      campaignType: "dual",
      currentWeek: 1,
      userBalance: START_BUDGET,
      allClubs: clubsSeeded,
      leagueFixtures: fixturesGen,
      tournamentFixtures: tournamentFixturesGen,
      cupBracket: bracketGen,
      currentCupRound: "Group",
      createdTime: Date.now(),
      lastPlayed: Date.now(),
      managerSkills: {
        xp: 0,
        level: 1,
        skillPoints: 0,
        tacticalMastermind: 0,
        negotiator: 0,
        youthDevelopment: 0,
      },
      newsFeed: [],
    };

    setSaveSlots([newSlot, ...saveSlots]);
    setActiveSlotId(newSlot.id);
    setIsCreatingNewSlot(false);
    setNewManagerName("");

    setSimMessage(`Career initialized! Welcome Coach ${newSlot.managerName}!`);
    setTimeout(() => setSimMessage(""), 4000);
    setCurrentTabProgress("MANAGER");

    // ── Generate board objectives for the new career ─────────────────────────
    const userClubForObjectives = clubsSeeded.find(c => c.id === newSelectedClubId) ?? clubsSeeded[0];
    const objectives = generateSeasonObjectives(userClubForObjectives, clubsSeeded.length, 1);
    setBoardState({ confidence: 50, objectives, season: 1 });

    // ── Reset financial ledger ───────────────────────────────────────────────
    setFinancialLedger([]);
    setTransferMarketState(EMPTY_TRANSFER_STATE);
  };

  // Delete a Save slot
  const promptDeleteSaveSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveToDelete(id);
  };

  const confirmDeleteSaveSlot = () => {
    if (saveToDelete) {
      setSaveSlots((prev) => prev.filter((s) => s.id !== saveToDelete));
      if (activeSlotId === saveToDelete) {
        setActiveSlotId(null);
      }
      setSaveToDelete(null);
    }
  };

  const cancelDeleteSaveSlot = () => {
    setSaveToDelete(null);
  };

  const handleHardReset = () => {
    if (activeSlotId) {
      const slot = saveSlots.find((s) => s.id === activeSlotId);
      if (slot) {
        const resetClubs = seedAllClubs();

        // Put user selected club index at 0
        const selectedIdx = resetClubs.findIndex((c) => c.id === userClubId);
        if (selectedIdx !== -1 && selectedIdx !== 0) {
          const temp = resetClubs[0];
          resetClubs[0] = resetClubs[selectedIdx];
          resetClubs[selectedIdx] = temp;
        }

        const teamIds = resetClubs.map((c) => c.id);
        const leagueClubs = teamIds.slice(0, 20);

        const resetFixtures = generateLeagueFixtures20(leagueClubs);
        const resetTournamentFixtures =
          generateTournamentGroupFixtures(resetClubs);
        const resetBracket: BracketNode[] = [];

        setAllClubs(resetClubs);
        setLeagueFixtures(resetFixtures);
        setTournamentFixtures(resetTournamentFixtures);
        setCupBracket(resetBracket);
        setCurrentWeek(1);
        setCurrentCupRound("Group");
        setUserBalance(START_BUDGET);

        saveCurrentSlotProgress(
          resetClubs,
          resetFixtures,
          resetBracket,
          1,
          "Group",
          START_BUDGET,
          resetTournamentFixtures,
        );
        setSimMessage(
          "Career progress reset to fresh week! Ready for kickoff.",
        );
        setTimeout(() => setSimMessage(""), 3000);
      }
    }
  };

  const currentActiveUserClub = allClubs.find((c) => c.id === userClubId) ||
    allClubs[0] || {
      id: "placeholder",
      name: "Placeholder Club",
      shortName: "PLC",
      color: "#38bdf8",
      primaryColor: "#38bdf8",
      secondaryColor: "#ffffff",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      streak: [],
      squad: [],
      coach: {
        id: "coach-placeholder",
        name: "Placeholder Coach",
        age: 45,
        nationality: "N/A",
        specialty: "Tactics",
        rating: 50,
        cost: 0,
      },
      mentality: "Balanced" as TeamMentalityType,
      trainingFacilities: 1,
      tacticsFacilities: 1,
      cardioFacilities: 1,
      medicalFacilities: 1,
      accommodationFacilities: 1,
    };

  // Core Simulation clock ticks
  useEffect(() => {
    if (isPlaying && activeSimulation) {
      simRef.current = setTimeout(() => {
        handleProgressSimOneTick();
      }, simSpeed);
    }
    return () => clearTimeout(simRef.current);
  }, [isPlaying, activeSimulation, simSpeed]);

  const handleProgressSimOneTick = () => {
    if (!activeSimulation) return;

    const homeClub = allClubs.find(
      (c) => c.id === activeSimulation.homeClubId,
    )!;
    const awayClub = allClubs.find(
      (c) => c.id === activeSimulation.awayClubId,
    )!;

    const updatedSim = simulateMatchTick(activeSimulation, homeClub, awayClub);
    setActiveSimulation(updatedSim);

    // Mid-match halt at halftime (tick 15) for physical coaching & substitutions panel
    if (updatedSim.tick === 15) {
      setIsPlaying(false);
      const isSpectator =
        updatedSim.isSpectating ||
        (updatedSim.homeClubId !== userClubId &&
          updatedSim.awayClubId !== userClubId);
      if (!isSpectator) {
        setIsHalftimeModalOpen(true);
      } else {
        setIsPlaying(true);
      }
    }

    if (updatedSim.isFinished) {
      handleFinalizeAndSettleMatch(updatedSim);
    }
  };

  // Commit score, goals, and card rosters of simulated match
  const handleFinalizeAndSettleMatch = (finalSim: LiveMatchSimulation) => {
    setIsPlaying(false);

    const weekInfo = DUAL_SCHEDULE.find((s) => s.week === currentWeek);
    const isLeagueMatch = weekInfo ? weekInfo.type === "league" : true;

    let updatedClubs = [...allClubs];
    let updatedFixtures = [...leagueFixtures];
    let updatedTournamentFixtures = [...tournamentFixtures];
    let updatedBracket = [...cupBracket];
    let updatedCupRound = currentCupRound;

    const homeClub = updatedClubs.find((c) => c.id === finalSim.homeClubId);
    const awayClub = updatedClubs.find((c) => c.id === finalSim.awayClubId);

    // Apply match ratings to active rosters
    if (homeClub && awayClub) {
      const diff = finalSim.homeScore - finalSim.awayScore;
      homeClub.squad.forEach((p) => {
        if (p.isStarting) {
          const r =
            randRange(64, 84) / 10 +
            diff * 0.3 +
            p.goals * 1.5 +
            p.assists * 1.0;
          p.matchRatings = [
            ...(p.matchRatings || []),
            Number(Math.min(10, Math.max(3, r)).toFixed(1)),
          ];
        }
      });
      awayClub.squad.forEach((p) => {
        if (p.isStarting) {
          const r =
            randRange(64, 84) / 10 -
            diff * 0.3 +
            p.goals * 1.5 +
            p.assists * 1.0;
          p.matchRatings = [
            ...(p.matchRatings || []),
            Number(Math.min(10, Math.max(3, r)).toFixed(1)),
          ];
        }
      });
    }

    if (isLeagueMatch) {
      // 1. Settle simulated user/spectated league fixture
      updatedFixtures = leagueFixtures.map((f) => {
        if (f.id === finalSim.fixtureId) {
          return {
            ...f,
            isCompleted: true,
            homeScore: finalSim.homeScore,
            awayScore: finalSim.awayScore,
            homeGoalsDetail: finalSim.homeShooters,
            awayGoalsDetail: finalSim.awayShooters,
            homePossession: Math.round(
              (finalSim.homePossessionScore /
                (finalSim.homePossessionScore + finalSim.awayPossessionScore ||
                  1)) *
                100,
            ),
            awayPossession:
              100 -
              Math.round(
                (finalSim.homePossessionScore /
                  (finalSim.homePossessionScore +
                    finalSim.awayPossessionScore || 1)) *
                  100,
              ),
            homeShots: finalSim.homeShots,
            awayShots: finalSim.awayShots,
            homeShotsOnTarget: finalSim.homeShotsOnTarget,
            awayShotsOnTarget: finalSim.awayShotsOnTarget,
          };
        }
        return f;
      });

      // Update league table parameters for both active match clubs
      if (homeClub && awayClub) {
        homeClub.played++;
        awayClub.played++;
        homeClub.goalsFor += finalSim.homeScore;
        homeClub.goalsAgainst += finalSim.awayScore;
        awayClub.goalsFor += finalSim.awayScore;
        awayClub.goalsAgainst += finalSim.homeScore;
        homeClub.goalDifference = homeClub.goalsFor - homeClub.goalsAgainst;
        awayClub.goalDifference = awayClub.goalsFor - awayClub.goalsAgainst;

        if (finalSim.homeScore > finalSim.awayScore) {
          homeClub.won++;
          homeClub.points += 3;
          homeClub.streak = [...(homeClub.streak || []), "W"];
          awayClub.lost++;
          awayClub.streak = [...(awayClub.streak || []), "L"];
        } else if (finalSim.homeScore < finalSim.awayScore) {
          awayClub.won++;
          awayClub.points += 3;
          awayClub.streak = [...(awayClub.streak || []), "W"];
          homeClub.lost++;
          homeClub.streak = [...(homeClub.streak || []), "L"];
        } else {
          homeClub.drawn++;
          homeClub.points += 1;
          homeClub.streak = [...(homeClub.streak || []), "D"];
          awayClub.drawn++;
          awayClub.points += 1;
          awayClub.streak = [...(awayClub.streak || []), "D"];
        }
      }
    } else {
      // 2. Champions Cup Week (Group stage or Knockout stage!)
      const stage = weekInfo?.stage || "Group";

      if (stage === "Group") {
        // Settle active simulated group match
        updatedTournamentFixtures = tournamentFixtures.map((f) => {
          if (f.id === finalSim.fixtureId) {
            return {
              ...f,
              isCompleted: true,
              homeScore: finalSim.homeScore,
              awayScore: finalSim.awayScore,
              homePossession: 50,
              awayPossession: 50,
              homeShots: finalSim.homeShots,
              awayShots: finalSim.awayShots,
            };
          }
          return f;
        });
      } else {
        // Knockout Phase match (R16, QF, SF, F)
        let winnerId =
          finalSim.homeScore > finalSim.awayScore
            ? finalSim.homeClubId
            : finalSim.awayClubId;
        let finalHomeScore = finalSim.homeScore;
        let finalAwayScore = finalSim.awayScore;
        let hPens: number | undefined = undefined;
        let aPens: number | undefined = undefined;

        // If tie, resolve by instant penalty simulation
        if (finalHomeScore === finalAwayScore) {
          hPens = randRange(3, 5);
          aPens = hPens === 5 ? randRange(2, 4) : 5;
          winnerId = hPens > aPens ? finalSim.homeClubId : finalSim.awayClubId;
        }

        updatedBracket = cupBracket.map((node) => {
          if (node.id === finalSim.fixtureId) {
            return {
              ...node,
              isCompleted: true,
              homeScore: finalHomeScore,
              awayScore: finalAwayScore,
              homePens: hPens,
              awayPens: aPens,
              winnerClubId: winnerId,
            };
          }
          return node;
        });

        if (stage === "F") {
          updatedCupRound = "FINISHED";
          setIsSeasonReviewOpen(true);
          const championshipWinnerName =
            allClubs.find((c) => c.id === winnerId)?.name || "Cup Champion";
          setSimMessage(
            `CHAMPIONS CONCLUDED! The Prestige Champions Cup trophy goes to ${championshipWinnerName}!`,
          );
        }
      }
    }

    // Award matchday financial payments
    let nextBalance = userBalance;
    let nextManagerSkills = managerSkills;

    const isUserPlaying =
      finalSim.homeClubId === userClubId || finalSim.awayClubId === userClubId;
    if (isUserPlaying) {
      let reward = 2200;
      let userWon = false;
      let userDrawn = false;
      let userLost = false;

      if (finalSim.homeClubId === userClubId) {
        if (finalSim.homeScore > finalSim.awayScore) userWon = true;
        else if (finalSim.homeScore === finalSim.awayScore) userDrawn = true;
        else userLost = true;
      } else {
        if (finalSim.awayScore > finalSim.homeScore) userWon = true;
        else if (finalSim.awayScore === finalSim.homeScore) userDrawn = true;
        else userLost = true;
      }

      if (userWon) {
        reward += 2800;
        nextManagerSkills = { ...nextManagerSkills, xp: nextManagerSkills.xp + 150 };
        setConsecutiveLosses(0);
        addNotification({ type: 'match', title: 'Victory!', body: `You won ${finalSim.homeScore}–${finalSim.awayScore}. Matchday revenue credited.` });
      } else if (userDrawn) {
        nextManagerSkills = { ...nextManagerSkills, xp: nextManagerSkills.xp + 50 };
        setConsecutiveLosses(0);
      } else if (userLost) {
        nextManagerSkills = { ...nextManagerSkills, xp: nextManagerSkills.xp + 25 };
        setConsecutiveLosses(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setShowPressureModal(true);
            addNotification({ type: 'board', title: 'Board Warning', body: `The board is concerned after ${newCount} consecutive defeats. Results must improve.` });
          }
          return newCount;
        });
      }

      if (nextManagerSkills.xp >= nextManagerSkills.level * 1000) {
        nextManagerSkills.level += 1;
        nextManagerSkills.skillPoints += 1;
        nextManagerSkills.xp -= (nextManagerSkills.level - 1) * 1000;
      }

      setManagerSkills(nextManagerSkills);

      // Matchday revenue (based on club reputation)
      const userClubObj = updatedClubs.find(c => c.id === userClubId);
      const rep = userClubObj?.reputation ?? 50;
      const matchdayRev = Math.round(rep * 800 + randRange(5000, 25000));
      reward += matchdayRev;

      if (!isLeagueMatch) reward += 1500;

      nextBalance = userBalance + reward;
      setUserBalance(nextBalance);
      setSimMessage(`Matchday complete! +$${reward.toLocaleString()} (incl. $${matchdayRev.toLocaleString()} matchday revenue)`);

      // Generate and show post-match analysis
      if (homeClub && awayClub && !finalSim.isSpectating) {
        const analysis = generatePostMatchAnalysis(finalSim, homeClub, awayClub);
        setPostMatchAnalysis(analysis);
      }
    } else {
      setSimMessage("Fixture simulation complete! Returned to matchday deck.");
    }

    // Update player form streaks for user club
    updatedClubs = updatedClubs.map(club => {
      if (club.id !== userClubId) return club;
      const userWon2 = (finalSim.homeClubId === userClubId && finalSim.homeScore > finalSim.awayScore)
        || (finalSim.awayClubId === userClubId && finalSim.awayScore > finalSim.homeScore);
      const userLost2 = (finalSim.homeClubId === userClubId && finalSim.homeScore < finalSim.awayScore)
        || (finalSim.awayClubId === userClubId && finalSim.awayScore < finalSim.homeScore);
      return {
        ...club,
        squad: club.squad.map(p => {
          if (!p.isStarting) return p;
          const lastRating = p.matchRatings[p.matchRatings.length - 1] || 6.0;
          let formDelta = 0;
          if (lastRating >= 7.0) formDelta = 1;
          else if (lastRating <= 5.5) formDelta = -1;
          const newFormStreak = Math.max(-5, Math.min(5, (p.formStreak || 0) + formDelta));
          return { ...p, formStreak: newFormStreak };
        }),
      };
    });

    // Save states and cache
    setAllClubs(updatedClubs);
    setLeagueFixtures(updatedFixtures);
    setTournamentFixtures(updatedTournamentFixtures);
    setCupBracket(updatedBracket);
    setCurrentCupRound(updatedCupRound as any);

    saveCurrentSlotProgress(
      updatedClubs,
      updatedFixtures,
      updatedBracket,
      currentWeek,
      updatedCupRound as any,
      nextBalance,
      updatedTournamentFixtures,
      undefined,
      nextManagerSkills,
    );

    // If activeSimulation matches finalSim, don't clear it right away!
    // The user will close it via the MatchConcluded view.
    // We update activeSimulation to have isFinished = true so MatchCenter renders the conclusion screen.
    if (activeSimulation && activeSimulation.fixtureId === finalSim.fixtureId) {
      setActiveSimulation({ ...finalSim, isFinished: true });
    }
  };

  // Launch Live Match Broadcaster
  const handleInitiateLiveSimulation = (
    fixtureId: string,
    homeId: string,
    awayId: string,
    isSpectating?: boolean,
  ) => {
    if (activeSimulation) return;
    
    // Find weather from fixture
    const f1 = leagueFixtures.find(f => f.id === fixtureId);
    const f2 = tournamentFixtures.find(f => f.id === fixtureId);
    const bt = cupBracket.find((f: any) => f.id === fixtureId) as any;
    const matchWeather = f1?.weather || f2?.weather || bt?.weather || undefined;

    setActiveSimulation({
      fixtureId,
      homeClubId: homeId,
      awayClubId: awayId,
      homeScore: 0,
      awayScore: 0,
      tick: 0,
      isFinished: false,
      weather: matchWeather,
      possession: "home",
      ballX: 50,
      ballY: 50,
      zone: "MID",
      events: [
        {
          tick: 0,
          minute: 0,
          type: "info",
          description: `Referee checks watch. Official Kickoff has begun!`,
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
      isSpectating:
        isSpectating || (homeId !== userClubId && awayId !== userClubId),
    });

    setCurrentTabProgress("FIXTURES");
    setIsPlaying(true);
    setSimSpeed(2000); // Always default to Broadcast (90s) speed when watching a live match
  };

  // Upgrades
  const handleUpgradeFacilities = (
    facilityType: "training" | "tactics" | "cardio" | "medical" | "accommodation",
    cost: number,
  ) => {
    if (userBalance < cost) return;
    const nextBalance = userBalance - cost;
    setUserBalance(nextBalance);

    const updated = allClubs.map((c) => {
      if (c.id === userClubId) {
        if (facilityType === "training") {
          return { ...c, trainingFacilities: c.trainingFacilities + 1 };
        } else if (facilityType === "tactics") {
          return { ...c, tacticsFacilities: c.tacticsFacilities + 1 };
        } else if (facilityType === "cardio") {
          return { ...c, cardioFacilities: c.cardioFacilities + 1 };
        } else if (facilityType === "medical") {
          return { ...c, medicalFacilities: (c.medicalFacilities || 1) + 1 };
        } else if (facilityType === "accommodation") {
          return { ...c, accommodationFacilities: (c.accommodationFacilities || 1) + 1 };
        }
      }
      return c;
    });

    setAllClubs(updated);
    // Track facility cost in financial ledger
    addFinancialEntry(buildFacilityEntry(
      facilityType.charAt(0).toUpperCase() + facilityType.slice(1),
      cost,
      currentWeek,
    ));
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
    setSimMessage(
      `Infrastructure upgraded! Invested $${cost.toLocaleString()} inside the facility centers.`,
    );
    setTimeout(() => setSimMessage(""), 2500);
  };

  const handleBuyPlayer = (newPlayer: Player, cost: number) => {
    const nextBalance = userBalance - cost;
    setUserBalance(nextBalance);

    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return {
          ...club,
          squad: [...club.squad, newPlayer],
        };
      }
      return club;
    });

    setAllClubs(updated);
    // Track in financial ledger
    addFinancialEntry(buildTransferOutEntry(newPlayer.name, cost, currentWeek));
    // Track in transfer history
    setTransferMarketState(prev => ({
      ...prev,
      history: [...prev.history, makeHistoryEntry({ type: 'bought', playerName: newPlayer.name, amount: cost, clubName: 'Transfer Market', week: currentWeek })],
    }));
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
  };

  const handleTakeoverClub = (clubId: string) => {
    const target = allClubs.find(c => c.id === clubId);
    if (!target) return;
    const cost = Math.round((target.reputation ?? 50) * 50000);
    setUserBalance(prev => prev - cost);
    setUserClubId(clubId);
    addNotification({
      type: 'general',
      title: 'Club Takeover',
      body: `You are now managing ${target.name}! Cost: $${cost.toLocaleString()}`,
    });
  };

  const handleSellYouth = (playerId: string, fee: number) => {
    setAllClubs(prev => prev.map(c => {
      if (c.id !== userClubId) return c;
      return { ...c, youthSquad: (c.youthSquad || []).filter(p => p.id !== playerId) };
    }));
    setUserBalance(prev => prev + fee);
    addNotification({ type: 'transfer', title: 'Youth Sold', body: `Youth player sold for $${fee.toLocaleString()}` });
  };

  const handlePromoteYouth = (playerId: string) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        const ySquad = club.youthSquad || [];
        const targetPlayer = ySquad.find((p) => p.id === playerId);
        if (!targetPlayer) return club;
        return {
          ...club,
          youthSquad: ySquad.filter((p) => p.id !== playerId),
          squad: [
            ...club.squad,
            { ...targetPlayer, isStarting: false, isYouth: false, isFocused: false },
          ],
        };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);
  };

  const handleSignYouthToAcademy = (player: Player, cost: number) => {
    const nextBalance = userBalance - cost;
    setUserBalance(nextBalance);

    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        const ySquad = club.youthSquad || [];
        return {
          ...club,
          youthSquad: [...ySquad, player],
        };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
  };

  const handleTogglePlayerFocus = (playerId: string) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        let isCurrentlyFocused = false;
        let currentFocusCount = 0;
        club.squad.forEach((p) => {
          if (p.isFocused) currentFocusCount++;
          if (p.id === playerId && p.isFocused) isCurrentlyFocused = true;
        });

        if (!isCurrentlyFocused && currentFocusCount >= 3) {
          return club; // Can't focus more than 3
        }

        return {
          ...club,
          squad: club.squad.map((p) =>
            p.id === playerId ? { ...p, isFocused: !p.isFocused } : p,
          ),
        };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);
  };

  const handleAssignCoachToPlayer = (playerId: string, coachId: string | null) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {

        return {
          ...club,
          squad: club.squad.map((p) =>
            p.id === playerId
              ? { ...p, focusedCoachId: coachId, isFocused: !!coachId }
              : (p.focusedCoachId === coachId && coachId !== null)
                  ? { ...p, focusedCoachId: null, isFocused: false }
                  : p
          ),
        };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);
  };

  const handleBuyCoach = (newCoach: Coach, cost: number) => {
    const nextBalance = userBalance - cost;
    setUserBalance(nextBalance);

    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return {
          ...club,
          coaches: [...(club.coaches || []), newCoach],
        };
      }
      return club;
    });

    setAllClubs(updated);
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
  };

  const handleDismissCoach = (coachId: string, refundAmount: number) => {
    const nextBalance = userBalance + refundAmount;
    setUserBalance(nextBalance);

    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return {
          ...club,
          coaches: (club.coaches || []).filter((c) => c.id !== coachId),
          // If dismissing the primary coach, keep it but also remove from coaches array
        };
      }
      return club;
    });

    setAllClubs(updated);
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
  };

  const handleSellPlayer = (playerId: string, value: number) => {
    const nextBalance = userBalance + value;
    setUserBalance(nextBalance);

    const soldPlayer = allClubs.find(c => c.id === userClubId)?.squad.find(p => p.id === playerId);
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return {
          ...club,
          squad: club.squad.filter((p) => p.id !== playerId),
        };
      }
      return club;
    });

    setAllClubs(updated);
    // Track in financial ledger
    if (soldPlayer) {
      addFinancialEntry(buildTransferInEntry(soldPlayer.name, value, currentWeek));
      setTransferMarketState(prev => ({
        ...prev,
        history: [...prev.history, makeHistoryEntry({ type: 'sold', playerName: soldPlayer.name, amount: value, clubName: 'Transfer Market', week: currentWeek })],
      }));
    }
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
  };

  const handleAdjustSquadLineup = (newSquad: Player[]) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return {
          ...club,
          squad: newSquad,
        };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);
  };

  const handlePlaystyleShift = (playstyle: PlaystyleType) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return { ...club, playstyle };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);

    if (activeSimulation) {
      if (activeSimulation.homeClubId === userClubId) {
        setActiveSimulation({ ...activeSimulation, userPlaystyle: playstyle });
      } else if (activeSimulation.awayClubId === userClubId) {
        setActiveSimulation({ ...activeSimulation, userPlaystyle: playstyle });
      }
    }
  };

  const handleTacticalShift = (mentality: TeamMentalityType) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return { ...club, mentality };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);
  };

  const handleFormationShift = (formation: TeamFormationType) => {
    const updated = allClubs.map((club) => {
      if (club.id === userClubId) {
        return { ...club, formation };
      }
      return club;
    });
    setAllClubs(updated);
    saveCurrentSlotProgress(updated);
  };

  const handleAddFunds = (amount: number) => {
    const nextBal = userBalance + amount;
    setUserBalance(nextBal);
    saveCurrentSlotProgress(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBal,
    );
  };

  // Skip simulation helper (Skips match center and auto-finalizes scores)
  const handleSkipOrQuickSim = () => {
    if (!activeSimulation) return;

    const h = allClubs.find((c) => c.id === activeSimulation.homeClubId)!;
    const a = allClubs.find((c) => c.id === activeSimulation.awayClubId)!;

    // Auto substitutions handled by assistant coach at skip
    runAssistantSubstitution(h);
    runAssistantSubstitution(a);

    const fixtureObject = quickSimulateFixture(h, a, activeSimulation.fixtureId);

    const mockFinalSim: LiveMatchSimulation = {
      ...activeSimulation,
      homeScore: fixtureObject.homeScore,
      awayScore: fixtureObject.awayScore,
      isFinished: true,
      homeShooters: Array(fixtureObject.homeScore).fill("Assigned Scorer"),
      awayShooters: Array(fixtureObject.awayScore).fill("Assigned Scorer"),
      homePossessionScore: 50,
      awayPossessionScore: 50,
      homeShots: randRange(8, 14),
      awayShots: randRange(8, 14),
    };

    handleFinalizeAndSettleMatch(mockFinalSim);
  };

  // Quick simulates a raw pending fixture from the Next Match tab
  const handleQuickSimulateMatch = (
    fixtureId: string,
    homeId: string,
    awayId: string,
  ) => {
    const h = allClubs.find((c) => c.id === homeId)!;
    const a = allClubs.find((c) => c.id === awayId)!;

    runAssistantSubstitution(h);
    runAssistantSubstitution(a);

    const fixtureObject = quickSimulateFixture(h, a, fixtureId);
    const weekInfo = DUAL_SCHEDULE.find((s) => s.week === currentWeek);

    const mockLiveSim: LiveMatchSimulation = {
      fixtureId,
      homeClubId: homeId,
      awayClubId: awayId,
      homeScore: fixtureObject.homeScore || 0,
      awayScore: fixtureObject.awayScore || 0,
      tick: 30,
      isFinished: true,
      possession: "home",
      ballX: 50,
      ballY: 50,
      zone: "MID",
      events: [
        {
          tick: 30,
          minute: 90,
          type: "info",
          description: `Quick match simulation settled successfully.`,
        },
      ],
      homeShooters:
        fixtureObject.homeGoalsDetail ||
        Array(fixtureObject.homeScore || 0).fill(""),
      awayShooters:
        fixtureObject.awayGoalsDetail ||
        Array(fixtureObject.awayScore || 0).fill(""),
      homeShots: fixtureObject.homeShots || 0,
      awayShots: fixtureObject.awayShots || 0,
      homeShotsOnTarget: fixtureObject.homeShotsOnTarget || 0,
      awayShotsOnTarget: fixtureObject.awayShotsOnTarget || 0,
      homePossessionScore: fixtureObject.homePossession || 50,
      awayPossessionScore: fixtureObject.awayPossession || 50,
      homeConcededFouls: randRange(3, 8),
      awayConcededFouls: randRange(3, 8),
      isSpectating: false,
    };

    handleFinalizeAndSettleMatch(mockLiveSim);
  };

  // Simulates all pending fixtures for the current week (both League or Prestige Champions Cup) and advances campaign week index
  const handleAdvanceCampaignWeek = () => {
    let updatedClubs = [...allClubs];
    let updatedFixtures = [...leagueFixtures];
    let updatedTournamentFixtures = tournamentFixtures
      ? [...tournamentFixtures]
      : [];
    let updatedBracket = [...cupBracket];
    let updatedCupRound = currentCupRound;

    const isGroupCupWeek =
      campaignType === "dual" &&
      (currentWeek === 3 || currentWeek === 6 || currentWeek === 9);
    const isBracketCupWeek =
      campaignType === "dual" &&
      (currentWeek === 12 ||
        currentWeek === 15 ||
        currentWeek === 18 ||
        currentWeek === 21);
    const isLeagueRound = !isGroupCupWeek && !isBracketCupWeek;

    if (isLeagueRound) {
      const pendingLeague = leagueFixtures.filter(
        (f) => f.week === currentWeek && !f.isCompleted,
      );
      pendingLeague.forEach((fix) => {
        const homeClub = updatedClubs.find((c) => c.id === fix.homeClubId)!;
        const awayClub = updatedClubs.find((c) => c.id === fix.awayClubId)!;
        const game = quickSimulateFixture(homeClub, awayClub);

        const target = updatedFixtures.find((f) => f.id === fix.id)!;
        target.homeScore = game.homeScore;
        target.awayScore = game.awayScore;
        target.isCompleted = true;
        target.homeGoalsDetail = game.homeGoalsDetail;
        target.awayGoalsDetail = game.awayGoalsDetail;
        target.homePossession = game.homePossession;
        target.awayPossession = game.awayPossession;
        target.homeShots = game.homeShots;
        target.awayShots = game.awayShots;
        target.homeShotsOnTarget = game.homeShotsOnTarget;
        target.awayShotsOnTarget = game.awayShotsOnTarget;

        const hC = updatedClubs.find((c) => c.id === fix.homeClubId)!;
        const aC = updatedClubs.find((c) => c.id === fix.awayClubId)!;
        hC.played++;
        aC.played++;
        hC.goalsFor += game.homeScore;
        hC.goalsAgainst += game.awayScore;
        aC.goalsFor += game.awayScore;
        aC.goalsAgainst += game.homeScore;
        hC.goalDifference = hC.goalsFor - hC.goalsAgainst;
        aC.goalDifference = aC.goalsFor - aC.goalsAgainst;

        if (game.homeScore > game.awayScore) {
          hC.won++;
          hC.points += 3;
          hC.streak.push("W");
          aC.lost++;
          aC.streak.push("L");
        } else if (game.homeScore < game.awayScore) {
          aC.won++;
          aC.points += 3;
          aC.streak.push("W");
          hC.lost++;
          hC.streak.push("L");
        } else {
          hC.drawn++;
          hC.points += 1;
          hC.streak.push("D");
          aC.drawn++;
          aC.points += 1;
          aC.streak.push("D");
        }
      });
    } else if (isGroupCupWeek) {
      const pendingCup = updatedTournamentFixtures.filter(
        (f) => f.week === currentWeek && !f.isCompleted,
      );
      pendingCup.forEach((fix) => {
        const homeClub = updatedClubs.find((c) => c.id === fix.homeClubId)!;
        const awayClub = updatedClubs.find((c) => c.id === fix.awayClubId)!;
        const game = quickSimulateFixture(homeClub, awayClub);

        const target = updatedTournamentFixtures.find((f) => f.id === fix.id)!;
        target.homeScore = game.homeScore;
        target.awayScore = game.awayScore;
        target.isCompleted = true;
        target.homeGoalsDetail = game.homeGoalsDetail;
        target.awayGoalsDetail = game.awayGoalsDetail;
        target.homePossession = game.homePossession;
        target.awayPossession = game.awayPossession;
        target.homeShots = game.homeShots;
        target.awayShots = game.awayShots;
        target.homeShotsOnTarget = game.homeShotsOnTarget;
        target.awayShotsOnTarget = game.awayShotsOnTarget;
      });

      if (currentWeek === 9) {
        const qualifiers: string[] = [];
        for (let gIdx = 0; gIdx < 8; gIdx++) {
          const standings = getGroupStandingsForGroup(
            gIdx,
            updatedClubs,
            updatedTournamentFixtures,
          );
          if (standings[0]) qualifiers.push(standings[0].club.id);
          if (standings[1]) qualifiers.push(standings[1].club.id);
        }
        const r16Nodes = generateCupBracket16FromGroups(qualifiers);
        updatedBracket = r16Nodes;
        updatedCupRound = "R16";
      }
    } else if (isBracketCupWeek) {
      const activeBracketRound = currentCupRound;
      const pendingNodes = updatedBracket.filter(
        (n) => n.round === activeBracketRound && !n.isCompleted,
      );
      pendingNodes.forEach((node) => {
        const hId = node.homeClubId || "";
        const aId = node.awayClubId || "";
        if (!hId || !aId) {
          node.isCompleted = true;
          node.winnerClubId = hId || aId || allClubs[0].id;
          return;
        }

        const homeClub = updatedClubs.find((c) => c.id === hId)!;
        const awayClub = updatedClubs.find((c) => c.id === aId)!;
        const game = quickSimulateFixture(homeClub, awayClub);
        node.homeScore = game.homeScore;
        node.awayScore = game.awayScore;
        node.isCompleted = true;
        node.homeGoalsDetail = game.homeGoalsDetail;
        node.awayGoalsDetail = game.awayGoalsDetail;
        node.homePossession = game.homePossession;
        node.awayPossession = game.awayPossession;
        node.homeShots = game.homeShots;
        node.awayShots = game.awayShots;
        node.homeShotsOnTarget = game.homeShotsOnTarget;
        node.awayShotsOnTarget = game.awayShotsOnTarget;

        if (game.homeScore > game.awayScore) {
          node.winnerClubId = hId;
        } else if (game.homeScore < game.awayScore) {
          node.winnerClubId = aId;
        } else {
          const coin = Math.random() > 0.5;
          node.homePens = coin ? 5 : 4;
          node.awayPens = coin ? 4 : 5;
          node.winnerClubId = coin ? hId : aId;
        }
      });

      const roundFinished = updatedBracket
        .filter((n) => n.round === activeBracketRound)
        .every((n) => n.isCompleted);
      if (roundFinished) {
        let nextRound: any = activeBracketRound;
        if (activeBracketRound === "R16") {
          const winners = updatedBracket
            .filter((b) => b.round === "R16")
            .map((b) => b.winnerClubId || "");
          for (let i = 0; i < 4; i++) {
            const matchNode = updatedBracket.find(
              (b) => b.id === `QF-${i + 1}`,
            );
            if (matchNode) {
              matchNode.homeClubId = winners[i * 2] || undefined;
              matchNode.awayClubId = winners[i * 2 + 1] || undefined;
            }
          }
          nextRound = "QF";
        } else if (activeBracketRound === "QF") {
          const winners = updatedBracket
            .filter((b) => b.round === "QF")
            .map((b) => b.winnerClubId || "");
          for (let i = 0; i < 2; i++) {
            const matchNode = updatedBracket.find(
              (b) => b.id === `SF-${i + 1}`,
            );
            if (matchNode) {
              matchNode.homeClubId = winners[i * 2] || undefined;
              matchNode.awayClubId = winners[i * 2 + 1] || undefined;
            }
          }
          nextRound = "SF";
        } else if (activeBracketRound === "SF") {
          const winners = updatedBracket
            .filter((b) => b.round === "SF")
            .map((b) => b.winnerClubId || "");
          const matchNode = updatedBracket.find((b) => b.id === "F-1");
          if (matchNode) {
            matchNode.homeClubId = winners[0] || undefined;
            matchNode.awayClubId = winners[1] || undefined;
          }
          nextRound = "F";
        }

        if (activeBracketRound === "F") {
          updatedCupRound = "FINISHED";
          setIsSeasonReviewOpen(true);
          const championshipWinnerName =
            allClubs.find(
              (c) =>
                c.id ===
                updatedBracket.find((b) => b.id === "F-1")?.winnerClubId,
            )?.name || "Cup Champion";
          setSimMessage(
            `CHAMPIONS CONCLUDED! The Prestige Champions Cup trophy goes to ${championshipWinnerName}!`,
          );
        } else {
          updatedCupRound = nextRound;
        }
      }
    }

    const recoveryFactor =
      16 + (currentActiveUserClub.medicalFacilities || 1) * 6;
    updatedClubs.forEach((cli) => {
      const baseGrowth = (cli.trainingFacilities || 1) * 2.5; // 2.5 to 12.5 per week base

      cli.squad.forEach((pp) => {
        // Stamina Recovery
        pp.stamina = Math.min(
          100,
          Number((pp.stamina + recoveryFactor).toFixed(1)),
        );

        // Training / Skill Growth
        let avgRating =
          pp.matchRatings && pp.matchRatings.length > 0
            ? pp.matchRatings.reduce((sum, r) => sum + r, 0) /
              pp.matchRatings.length
            : 6.0;

        if (cli.id === userClubId) {
          avgRating += managerSkills.tacticalMastermind * 0.15; // Tactical boost
        }

        const performanceBonus = Math.max(0, (avgRating - 6.0) * 3); // 0 to 12 max
        const agePenalty = pp.rating > 90 ? 8 : pp.rating > 85 ? 4 : 0; // Harder to grow if already elite

        let youthBonus = 0;
        if (cli.id === userClubId && pp.age && pp.age <= 23) {
          youthBonus = managerSkills.youthDevelopment * 2.0;

          // Backroom staff youth/development coaches add direct flat bonus
          const youthCoaches = (cli.coaches || []).filter(
            (c) => c.specialty === "Development",
          );
          youthBonus += youthCoaches.reduce((acc, c) => acc + c.rating / 40, 0);
        }

        let focusBonus = 0;
        if (pp.isFocused) {
          focusBonus = 4.0;
          if (pp.focusedCoachId) {
            const allStaff = [cli.coach, ...(cli.coaches || [])];
            const assignedCoach = allStaff.find(c => c && c.id === pp.focusedCoachId);
            if (assignedCoach) {
              focusBonus += assignedCoach.rating / 10;
            }
          }
        }

        const finalGrowth = Math.max(
          1,
          Math.round(
            baseGrowth +
              performanceBonus -
              agePenalty +
              Math.random() * 4 +
              youthBonus +
              focusBonus,
          ),
        );

        pp.trainingProgress = (pp.trainingProgress || 0) + finalGrowth;

        // Level up!
        if (pp.trainingProgress >= 100) {
          pp.trainingProgress -= 100;
          pp.rating = Math.min(99, pp.rating + 1);
        }
      });
    });

    // ── Rich procedural news generation ────────────────────────────────────
    const newNewsItems: NewsItem[] = [];
    const mkId = () => `news-${Date.now()}-${randRange(100,9999)}`;
    const sortedTable = [...updatedClubs].sort((a,b) => b.won*3+b.drawn - (a.won*3+a.drawn));

    // 1. Form headlines from completed fixtures this week
    updatedClubs.forEach(club => {
      const lastResult = club.streak[club.streak.length - 1];
      const recentStreak = club.streak.slice(-3).join('');
      if (Math.random() > 0.82) {
        if (recentStreak === 'WWW') {
          newNewsItems.push({ id: mkId(), week: currentWeek, type: 'match',
            headline: `🔥 ${club.name} On Fire — Three Consecutive Wins Has Fans Dreaming Of Glory!` });
        } else if (recentStreak === 'LLL') {
          newNewsItems.push({ id: mkId(), week: currentWeek, type: 'general',
            headline: `⚠️ Crisis at ${club.name} — Three Straight Defeats Piles Pressure On The Dugout` });
        } else if (lastResult === 'W') {
          newNewsItems.push({ id: mkId(), week: currentWeek, type: 'match',
            headline: `✅ ${club.name} Pick Up Vital Three Points In Tense Encounter` });
        } else if (lastResult === 'L') {
          newNewsItems.push({ id: mkId(), week: currentWeek, type: 'general',
            headline: `📉 ${club.name} Suffer Defeat — Questions Being Asked In The Boardroom` });
        }
      }
    });

    // 2. League table story
    if (Math.random() > 0.65) {
      const leader = sortedTable[0];
      const second = sortedTable[1];
      if (leader) {
        newNewsItems.push({ id: mkId(), week: currentWeek, type: 'match',
          headline: `🏆 League Update: ${leader.name} Top The Table With ${leader.won*3+leader.drawn} Points — ${second?.name ?? 'Rivals'} Give Chase` });
      }
    }

    // 3. Relegation zone story
    if (Math.random() > 0.7 && sortedTable.length >= 3) {
      const bottom = sortedTable[sortedTable.length - 1];
      newNewsItems.push({ id: mkId(), week: currentWeek, type: 'general',
        headline: `🔴 Relegation Battle: ${bottom.name} Sit Rock Bottom — Time Running Out For A Turnaround` });
    }

    // 4. Transfer rumour
    if (Math.random() > 0.6) {
      const club1 = updatedClubs[randRange(0, updatedClubs.length - 1)];
      const club2 = updatedClubs[randRange(0, updatedClubs.length - 1)];
      const star = club1.squad.sort((a,b) => b.rating - a.rating)[0];
      if (star && club1.id !== club2.id) {
        newNewsItems.push({ id: mkId(), week: currentWeek, type: 'transfer',
          headline: `💬 Transfer Whispers: ${club2.name} Reportedly Eyeing A Move For ${star.name} (${club1.name})` });
      }
    }

    // 5. Player milestone
    if (Math.random() > 0.75) {
      const featuredClub = updatedClubs[randRange(0, updatedClubs.length - 1)];
      const scorer = [...featuredClub.squad].sort((a,b) => b.goals - a.goals)[0];
      if (scorer && scorer.goals >= 5) {
        newNewsItems.push({ id: mkId(), week: currentWeek, type: 'match',
          headline: `⚽ ${scorer.name} (${featuredClub.name}) Hits ${scorer.goals} Goals This Season — Leading The Golden Boot Race` });
      }
    }

    // 6. Random injury at another club
    if (Math.random() > 0.7) {
      const club = updatedClubs.filter(c => c.id !== userClubId)[randRange(0, updatedClubs.length - 2)];
      if (club) {
        const victim = club.squad[randRange(0, club.squad.length - 1)];
        newNewsItems.push({ id: mkId(), week: currentWeek, type: 'injury',
          headline: `🏥 Injury Setback For ${club.name}: ${victim.name} Faces Spell On Sidelines` });
      }
    }

    // 7. Young talent story
    if (Math.random() > 0.8) {
      const club = updatedClubs[randRange(0, updatedClubs.length - 1)];
      const youngster = club.squad.filter(p => p.age <= 21).sort((a,b) => b.rating - a.rating)[0];
      if (youngster) {
        newNewsItems.push({ id: mkId(), week: currentWeek, type: 'general',
          headline: `🌟 Wonderkid Watch: ${youngster.name} (${youngster.age}) Of ${club.name} Tipped For A Huge Future` });
      }
    }

    // 8. User club headline (always include one about user's team)
    const userClubState = updatedClubs.find(c => c.id === userClubId);
    if (userClubState) {
      const pos = sortedTable.findIndex(c => c.id === userClubId) + 1;
      newNewsItems.push({ id: mkId(), week: currentWeek, type: 'match',
        headline: `📊 ${userClubState.name} Sit ${pos === 1 ? 'Top Of The League' : pos <= 3 ? `${pos}nd In The Table — European Contention` : pos >= sortedTable.length - 2 ? 'In The Danger Zone — Action Needed' : `${pos}th — Mid-Table Stability`}` });
    }

    // ── Weekly development processing for all clubs ──────────────────────
    updatedClubs = updatedClubs.map(club => {
      const isUser = club.id === userClubId;
      const devResult = processWeeklyDevelopment(club, currentWeek, isUser);
      if (isUser && devResult.events.length > 0) {
        devResult.events.forEach(ev => {
          if (ev.type === 'injury') {
            newNewsItems.push({
              id: `dev-${ev.playerId}-${Date.now()}`,
              week: currentWeek,
              type: 'injury',
              headline: ev.message,
            });
          } else if (ev.type === 'growth' || ev.type === 'potential_unlock') {
            newNewsItems.push({
              id: `dev-${ev.playerId}-${Date.now()}`,
              week: currentWeek,
              type: 'general',
              headline: ev.message,
            });
          }
        });
        // Collect low-morale players for the decision modal
        const unrestPlayers = devResult.updatedClub.squad.filter(p => (p.morale ?? 70) < 40);
        if (unrestPlayers.length > 0) {
          setPendingMoraleEvents(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            return [...prev, ...unrestPlayers.filter(p => !existingIds.has(p.id))];
          });
        }
      }
      // Youth graduation: any youth player aged 18+ can move to first team
      const { club: clubAfterGrad } = processYouthGraduation(devResult.updatedClub);
      return clubAfterGrad;
    });

    const nextWeek = currentWeek + 1;
    let nextNews = [...newNewsItems, ...newsFeed].slice(0, 30); // Keep max 30 news
    setNewsFeed(nextNews);

    // ── Weekly financial entries ─────────────────────────────────────────────
    const userClubForFinance = updatedClubs.find(c => c.id === userClubId);
    if (userClubForFinance) {
      addFinancialEntry(buildWeeklyWageEntry(userClubForFinance, currentWeek));
    }

    // ── Purge stale bids when window closes ──────────────────────────────────
    setTransferMarketState(prev => purgeStaleBids(prev, nextWeek));

    // ── Generate incoming bids if window is opening ──────────────────────────
    const currentPhase = getTransferWindowPhase(currentWeek);
    const nextPhase    = getTransferWindowPhase(nextWeek);
    if (currentPhase === 'closed' && nextPhase !== 'closed' && userClubForFinance) {
      const newBids = generateIncomingBids(userClubForFinance, updatedClubs, nextWeek);
      if (newBids.length > 0) {
        setTransferMarketState(prev => ({ ...prev, incomingBids: [...prev.incomingBids, ...newBids] }));
        addNotification({ type: 'transfer', title: 'Transfer Window Open', body: `${newBids.length} club(s) have made offers for your players` });
      }
    }

    // ── Refresh board objective progress ─────────────────────────────────────
    setBoardState(prev => ({
      ...prev,
      objectives: refreshObjectiveProgress(
        prev.objectives,
        userClubForFinance ?? updatedClubs[0],
        updatedClubs,
        updatedCupRound,
        nextWeek,
      ),
    }));

    if (nextWeek > 26) {
      setIsSeasonReviewOpen(true);
      setSimMessage(
        "CAMPAIGN YEAR COMPLETED! Both Elite SuperLeague & Prestige Champions Cup are finished. The board is now reviewing your season statistics!",
      );
    } else {
      setCurrentWeek(nextWeek);
      setSimMessage(
        `Campaign round advanced to Week ${nextWeek}! All CPU matchday outcomes simulated.`,
      );
    }

    setAllClubs(updatedClubs);
    setLeagueFixtures(updatedFixtures);
    setTournamentFixtures(updatedTournamentFixtures);
    setCupBracket(updatedBracket);
    setCurrentCupRound(updatedCupRound as any);

    saveCurrentSlotProgress(
      updatedClubs,
      updatedFixtures,
      updatedBracket,
      nextWeek > 26 ? 26 : nextWeek,
      updatedCupRound as any,
      userBalance,
      updatedTournamentFixtures,
    );
  };

  // Current active fixtures list
  const currentWeekFixtures = () => {
    const weekInfo = DUAL_SCHEDULE.find((s) => s.week === currentWeek);
    const isLeagueMatch = weekInfo ? weekInfo.type === "league" : true;

    if (campaignType === "league") {
      return leagueFixtures.filter(
        (f) => f.week === currentWeek && !f.isCompleted,
      );
    }

    // For dual campaign type
    if (isLeagueMatch) {
      return leagueFixtures.filter(
        (f) => f.week === currentWeek && !f.isCompleted,
      );
    } else {
      // It is a tournament week
      const stage = weekInfo?.stage || "R16";
      if (stage === "Group") {
        return tournamentFixtures.filter(
          (f) => f.week === currentWeek && !f.isCompleted,
        );
      } else {
        return cupBracket.filter((n) => n.round === stage && !n.isCompleted);
      }
    }
  };

  const activeMatchesToPlay = currentWeekFixtures();

  // Simulates all pending fixtures for the current week without advancing the matchday week timeline itself
  const handleSimulateAllRemainingMatches = () => {
    const weekInfo = DUAL_SCHEDULE.find((s) => s.week === currentWeek);
    const isLeagueMatch = weekInfo ? weekInfo.type === "league" : true;

    let updatedClubs = [...allClubs];
    let updatedFixtures = [...leagueFixtures];
    let updatedTournamentFixtures = tournamentFixtures
      ? [...tournamentFixtures]
      : [];
    let updatedBracket = [...cupBracket];
    let updatedCupRound = currentCupRound;

    if (campaignType === "league") {
      const pending = updatedFixtures.filter(
        (f) => f.week === currentWeek && !f.isCompleted,
      );
      pending.forEach((match) => {
        const hClub = updatedClubs.find((c) => c.id === match.homeClubId)!;
        const aClub = updatedClubs.find((c) => c.id === match.awayClubId)!;
        const res = quickSimulateFixture(hClub, aClub);

        match.isCompleted = true;
        match.homeScore = res.homeScore;
        match.awayScore = res.awayScore;
        match.homePossession = res.homePossession;
        match.awayPossession = res.awayPossession;
        match.homeShots = res.homeShots;
        match.awayShots = res.awayShots;
        match.homeShotsOnTarget = res.homeShotsOnTarget;
        match.awayShotsOnTarget = res.awayShotsOnTarget;
        match.homeGoalsDetail = res.homeGoalsDetail;
        match.awayGoalsDetail = res.awayGoalsDetail;

        hClub.played++;
        aClub.played++;
        hClub.goalsFor += res.homeScore;
        hClub.goalsAgainst += res.awayScore;
        aClub.goalsFor += res.awayScore;
        aClub.goalsAgainst += res.homeScore;
        hClub.goalDifference = hClub.goalsFor - hClub.goalsAgainst;
        aClub.goalDifference = aClub.goalsFor - aClub.goalsAgainst;

        if (res.homeScore > res.awayScore) {
          hClub.won++;
          hClub.points += 3;
          hClub.streak = [...(hClub.streak || []), "W"];
          aClub.lost++;
          aClub.streak = [...(aClub.streak || []), "L"];
        } else if (res.homeScore < res.awayScore) {
          aClub.won++;
          aClub.points += 3;
          aClub.streak = [...(aClub.streak || []), "W"];
          hClub.lost++;
          hClub.streak = [...(hClub.streak || []), "L"];
        } else {
          hClub.drawn++;
          hClub.points += 1;
          hClub.streak = [...(hClub.streak || []), "D"];
          aClub.drawn++;
          aClub.points += 1;
          aClub.streak = [...(aClub.streak || []), "D"];
        }
      });
    } else {
      // dual/tournament week
      if (isLeagueMatch) {
        const pending = updatedFixtures.filter(
          (f) => f.week === currentWeek && !f.isCompleted,
        );
        pending.forEach((match) => {
          const hClub = updatedClubs.find((c) => c.id === match.homeClubId)!;
          const aClub = updatedClubs.find((c) => c.id === match.awayClubId)!;
          const res = quickSimulateFixture(hClub, aClub);

          match.isCompleted = true;
          match.homeScore = res.homeScore;
          match.awayScore = res.awayScore;
          match.homePossession = res.homePossession;
          match.awayPossession = res.awayPossession;
          match.homeShots = res.homeShots;
          match.awayShots = res.awayShots;
          match.homeShotsOnTarget = res.homeShotsOnTarget;
          match.awayShotsOnTarget = res.awayShotsOnTarget;
          match.homeGoalsDetail = res.homeGoalsDetail;
          match.awayGoalsDetail = res.awayGoalsDetail;

          hClub.played++;
          aClub.played++;
          hClub.goalsFor += res.homeScore;
          hClub.goalsAgainst += res.awayScore;
          aClub.goalsFor += res.awayScore;
          aClub.goalsAgainst += res.homeScore;
          hClub.goalDifference = hClub.goalDifference =
            hClub.goalsFor - hClub.goalsAgainst;
          aClub.goalDifference = aClub.goalsFor - aClub.goalsAgainst;

          if (res.homeScore > res.awayScore) {
            hClub.won++;
            hClub.points += 3;
            hClub.streak = [...(hClub.streak || []), "W"];
            aClub.lost++;
            aClub.streak = [...(aClub.streak || []), "L"];
          } else if (res.homeScore < res.awayScore) {
            aClub.won++;
            aClub.points += 3;
            aClub.streak = [...(aClub.streak || []), "W"];
            hClub.lost++;
            hClub.streak = [...(hClub.streak || []), "L"];
          } else {
            hClub.drawn++;
            hClub.points += 1;
            hClub.streak = [...(hClub.streak || []), "D"];
            aClub.drawn++;
            aClub.points += 1;
            aClub.streak = [...(aClub.streak || []), "D"];
          }
        });
      } else {
        const stage = weekInfo?.stage || "R16";
        if (stage === "Group") {
          const pendingGroup = updatedTournamentFixtures.filter(
            (f) => f.week === currentWeek && !f.isCompleted,
          );
          pendingGroup.forEach((match) => {
            const mHome = updatedClubs.find((c) => c.id === match.homeClubId)!;
            const mAway = updatedClubs.find((c) => c.id === match.awayClubId)!;
            const res = quickSimulateFixture(mHome, mAway, match.id);

            match.isCompleted = true;
            match.homeScore = res.homeScore;
            match.awayScore = res.awayScore;
            match.homePossession = res.homePossession;
            match.awayPossession = res.awayPossession;
            match.homeShots = res.homeShots;
            match.awayShots = res.awayShots;
            match.homeShotsOnTarget = res.homeShotsOnTarget;
            match.awayShotsOnTarget = res.awayShotsOnTarget;
            match.homeGoalsDetail = res.homeGoalsDetail;
            match.awayGoalsDetail = res.awayGoalsDetail;
          });

          if (currentWeek === 9) {
            const qualifiers: string[] = [];
            for (let g = 0; g < 8; g++) {
              const standings = getGroupStandingsForGroup(
                g,
                updatedClubs,
                updatedTournamentFixtures,
              );
              const w1Id = standings[0]?.club.id;
              const w2Id = standings[1]?.club.id;
              if (w1Id) qualifiers.push(w1Id);
              if (w2Id) qualifiers.push(w2Id);
            }
            updatedBracket = generateCupBracket16FromGroups(qualifiers);
            updatedCupRound = "R16";
          }
        } else {
          // Knockout stage week
          const pendingNodes = updatedBracket.filter(
            (node) => node.round === stage && !node.isCompleted,
          );
          pendingNodes.forEach((match) => {
            const mHome = updatedClubs.find((c) => c.id === match.homeClubId)!;
            const mAway = updatedClubs.find((c) => c.id === match.awayClubId)!;
            const res = quickSimulateFixture(mHome, mAway, `cup-bracket-${match.id}`);

            let matchWinner =
              res.homeScore > res.awayScore ? mHome.id : mAway.id;
            let mockHomePens: number | undefined = undefined;
            let mockAwayPens: number | undefined = undefined;

            if (res.homeScore === res.awayScore) {
              mockHomePens = randRange(3, 5);
              mockAwayPens = mockHomePens === 5 ? randRange(2, 4) : 5;
              matchWinner = mockHomePens > mockAwayPens ? mHome.id : mAway.id;
            }

            match.isCompleted = true;
            match.homeScore = res.homeScore;
            match.awayScore = res.awayScore;
            match.homePens = mockHomePens;
            match.awayPens = mockAwayPens;
            match.winnerClubId = matchWinner;
          });

          // Advance bracket nodes structure based on current level completion
          const roundFinished = updatedBracket
            .filter((n) => n.round === stage)
            .every((n) => n.isCompleted);
          if (roundFinished) {
            let nextRound: any = currentCupRound;
            if (stage === "R16") {
              const winners = updatedBracket
                .filter((b) => b.round === "R16")
                .map((b) => b.winnerClubId || "");
              for (let i = 0; i < 4; i++) {
                const matchNode = updatedBracket.find(
                  (b) => b.id === `QF-${i + 1}`,
                );
                if (matchNode) {
                  matchNode.homeClubId = winners[i * 2] || undefined;
                  matchNode.awayClubId = winners[i * 2 + 1] || undefined;
                }
              }
              nextRound = "QF";
            } else if (stage === "QF") {
              const winners = updatedBracket
                .filter((b) => b.round === "QF")
                .map((b) => b.winnerClubId || "");
              for (let i = 0; i < 2; i++) {
                const matchNode = updatedBracket.find(
                  (b) => b.id === `SF-${i + 1}`,
                );
                if (matchNode) {
                  matchNode.homeClubId = winners[i * 2] || undefined;
                  matchNode.awayClubId = winners[i * 2 + 1] || undefined;
                }
              }
              nextRound = "SF";
            } else if (stage === "SF") {
              const winners = updatedBracket
                .filter((b) => b.round === "SF")
                .map((b) => b.winnerClubId || "");
              const matchNode = updatedBracket.find((b) => b.id === "F-1");
              if (matchNode) {
                matchNode.homeClubId = winners[0] || undefined;
                matchNode.awayClubId = winners[1] || undefined;
              }
              nextRound = "F";
            }

            if (stage === "F") {
              updatedCupRound = "FINISHED";
              setIsSeasonReviewOpen(true);
              const championshipWinnerName =
                allClubs.find(
                  (c) =>
                    c.id ===
                    updatedBracket.find((b) => b.id === "F-1")?.winnerClubId,
                )?.name || "Cup Champion";
              setSimMessage(
                `CHAMPIONS CONCLUDED! The Prestige Champions Cup trophy goes to ${championshipWinnerName}!`,
              );
            } else {
              updatedCupRound = nextRound;
            }
          }
        }
      }
    }

    setAllClubs(updatedClubs);
    setLeagueFixtures(updatedFixtures);
    setTournamentFixtures(updatedTournamentFixtures);
    setCupBracket(updatedBracket);
    setCurrentCupRound(updatedCupRound as any);
    setSimMessage("Simulated remaining fixtures for this week!");

    saveCurrentSlotProgress(
      updatedClubs,
      updatedFixtures,
      updatedBracket,
      currentWeek,
      updatedCupRound as any,
      userBalance,
      updatedTournamentFixtures,
    );
  };

  // Dossier Helpers
  // Morale decision handler — resolves top pending morale event
  const handleMoraleDecision = (choice: "start" | "wage" | "train" | "list") => {
    const player = pendingMoraleEvents[0];
    if (!player) return;

    setAllClubs(prev => prev.map(club => {
      if (club.id !== userClubId) return club;
      const updatedSquad = club.squad.map(p => {
        if (p.id !== player.id) return p;
        let moraleDelta = 0;
        if (choice === "start") moraleDelta = 15;
        else if (choice === "wage") moraleDelta = 20;
        else if (choice === "train") moraleDelta = -5;
        else if (choice === "list") moraleDelta = 0; // stabilise at 45

        const newMorale = choice === "list" ? 45 : Math.min(100, Math.max(0, (p.morale ?? 70) + moraleDelta));
        return { ...p, morale: newMorale };
      });
      return { ...club, squad: updatedSquad };
    }));

    if (choice === "wage") {
      setUserBalance(prev => prev - 2000);
    }
    // Dismiss the event
    setPendingMoraleEvents(prev => prev.slice(1));
  };

    const handleOpenPlayerDossier = (id: string) => {
    setActivePlayerDossierId(id);
    setActiveClubDossierId(null);
  };

  const handleOpenClubDossier = (id: string) => {
    setActiveClubDossierId(id);
    setActivePlayerDossierId(null);
  };

  // Find referenced models for Dossier Modal — searches squad + youth + market
  const getDossierPlayerModel = (): Player | null => {
    if (!activePlayerDossierId) return null;
    for (const club of allClubs) {
      const inSquad = club.squad.find((p) => p.id === activePlayerDossierId);
      if (inSquad) return inSquad;
      const inYouth = (club.youthSquad || []).find((p) => p.id === activePlayerDossierId);
      if (inYouth) return inYouth;
    }
    return null;
  };

  const getDossierClubModel = (): Club | null => {
    if (!activeClubDossierId) return null;
    return allClubs.find((c) => c.id === activeClubDossierId) || null;
  };

  const dossierPlayer = getDossierPlayerModel();
  const dossierClub = getDossierClubModel();

  // Helper inside the component body to capture the end-of-season trophy winners
  const captureSeasonTrophies = (
    clubsList: Club[],
    bracketList: BracketNode[],
  ): TrophyRecord => {
    // 1. League winner
    const leagueClubs = [...clubsList].slice(0, 20);
    leagueClubs.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    const lWinner = leagueClubs[0];

    // 2. Tournament winner
    const fbF = bracketList.find((b) => b.id === "F-1" || b.round === "F");
    const tWinnerId = fbF?.winnerClubId;
    const tWinner = clubsList.find((c) => c.id === tWinnerId) || clubsList[2]; // fallback to a good club

    // 3. Golden Boot
    let topScorer: Player | null = null;
    let topScorerClubName = "";
    let maxGoals = -1;

    // 4. Golden Glove
    let topGK: Player | null = null;
    let topGKClubName = "";
    let maxSaves = -1;

    clubsList.forEach((cl) => {
      cl.squad.forEach((pl) => {
        const totalGoals = (pl.goals || 0) + (pl.tournamentGoals || 0);
        if (totalGoals > maxGoals) {
          maxGoals = totalGoals;
          topScorer = pl;
          topScorerClubName = cl.name;
        }

        const totalSaves = (pl.saves || 0) + (pl.tournamentSaves || 0);
        if (totalSaves > maxSaves) {
          maxSaves = totalSaves;
          topGK = pl;
          topGKClubName = cl.name;
        }
      });
    });

    const currentSeasonNum = historyTrophies.length + 1;

    return {
      season: currentSeasonNum,
      leagueWinner: lWinner ? lWinner.name : "Unknown Club",
      leagueWinnerColor: lWinner ? lWinner.color : "#3abdf8",
      tournamentWinner: tWinner ? tWinner.name : "Unknown Club",
      tournamentWinnerColor: tWinner ? tWinner.color : "#facc15",
      goldenBootName: topScorer ? (topScorer as Player).name : "No Goalscorer",
      goldenBootClub: topScorerClubName || "Unknown Club",
      goldenBootGoals: maxGoals > 0 ? maxGoals : 0,
      goldenGloveName: topGK ? (topGK as Player).name : "No Goalkeeper",
      goldenGloveClub: topGKClubName || "Unknown Club",
      goldenGloveSaves: maxSaves > 0 ? maxSaves : 0,
    };
  };

  // End of Season Choices handler
  const handleSeasonResolution = (choice: "stay" | "change" | "reset") => {
    setIsSeasonReviewOpen(false);

    if (choice === "stay" || choice === "change") {
      // 1. Award prize money based on league finish position
      const leagueStandings = [...allClubs].slice(0, 20).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      const userFinishPosition = leagueStandings.findIndex(c => c.id === userClubId);
      const prizeMoney = LEAGUE_PRIZE_MONEY[Math.max(0, userFinishPosition)] || 10000;
      const balanceAfterPrize = userBalance + prizeMoney;
      setUserBalance(balanceAfterPrize);
      addNotification({
        type: 'general',
        title: 'Season Prize Money',
        body: `Finished ${userFinishPosition + 1}${['st','nd','rd'][userFinishPosition] || 'th'} in the league. Prize money: $${prizeMoney.toLocaleString()}`,
      });

      // 2. Update club reputation based on finish
      const updatedReputationClubs = allClubs.map(club => {
        if (club.id !== userClubId) return club;
        const pos = userFinishPosition;
        let repChange = 0;
        if (pos === 0) repChange = 15;
        else if (pos <= 3) repChange = 8;
        else if (pos <= 9) repChange = 3;
        else if (pos <= 14) repChange = -3;
        else repChange = -8;
        return { ...club, reputation: Math.max(0, Math.min(100, (club.reputation ?? 50) + repChange)) };
      });
      setAllClubs(updatedReputationClubs);

      // 3. Capture the final trophies achieved during this campaign year
      const newTrophy = captureSeasonTrophies(updatedReputationClubs, cupBracket);
      const nextTrophies = [...historyTrophies, newTrophy];
      setHistoryTrophies(nextTrophies);

      // 2. Select next manager seat (optionally transfer operation base)
      let nextActiveUserClubId = userClubId;
      let feedbackMsg =
        "Contract Prolonged! Stayed in first seat of the club for another year.";

      if (choice === "change") {
        const availableClubs = allClubs
          .filter((c) => c.id !== userClubId)
          .slice(0, 8);
        const nextClub =
          availableClubs[randRange(0, availableClubs.length - 1)] ||
          allClubs[2];
        nextActiveUserClubId = nextClub.id;
        setUserClubId(nextClub.id);
        feedbackMsg = `Job Accepted! Transferred to direct operations at ${nextClub.name}!`;
      }

      // 4. Clean statistics records and individual player records across all clubs
      // Also perform aging, retirement, and wonderkid spawning
      const resetStatsClubs = updatedReputationClubs.map((c) => {
        let currentSquad: Player[] = c.squad.map((p) => ({
          ...p,
          age: (p.age || 25) + 1, // Age up
          stamina: 100,
          goals: 0,
          assists: 0,
          saves: 0,
          yellowCards: 0,
          redCards: 0,
          matchRatings: [],
          tournamentGoals: 0,
          tournamentAssists: 0,
          tournamentSaves: 0,
          tournamentYellowCards: 0,
          tournamentRedCards: 0,
          rating:
            p.age && p.age >= 33
              ? Math.max(30, p.rating - randRange(1, 3))
              : p.rating, // Older players start declining
        }));

        // Players retiring (age > 36 occasionally)
        currentSquad = currentSquad.filter(
          (p) => !(p.age >= 36 && Math.random() > 0.4) && p.age <= 38,
        );

        // Fill back up to 15-20 players with wonderkids
        while (currentSquad.length < 15) {
          currentSquad.push(
            generateWonderkid(`wk-${Date.now()}-${randRange(1000, 9999)}`),
          );
        }

        return {
          ...c,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          streak: [],
          squad: currentSquad,
        };
      });

      // ── Relegation & Promotion ─────────────────────────────────────────────
      // Bottom 3 of the top 20 (by points) get relegated; 3 new clubs promoted
      const leagueTable = [...resetStatsClubs].slice(0, 20).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      const relegatedIds = new Set(leagueTable.slice(17).map(c => c.id));
      // Keep relegated clubs in the pool but demote them (lower reputation)
      const afterRelegation = resetStatsClubs.map(c => {
        if (!relegatedIds.has(c.id)) return c;
        // Repurpose relegated clubs: fresh squad, reduced reputation
        const promIdx = leagueTable.slice(17).findIndex(lc => lc.id === c.id);
        const newName = ['Valley United', 'Riverside City', 'Northgate Athletic'][promIdx] ?? c.name;
        return {
          ...c,
          name: newName,
          reputation: Math.max(10, (c.reputation ?? 40) - 15),
          squad: Array.from({ length: 18 }, (_, pi) => generateWonderkid(`promo-${Date.now()}-${pi}`)),
        };
      });

      // Promoted clubs: regenerate relegated teams with fresh squads to represent new entrants
      const promotedClubNames = ['Valley United', 'Riverside City', 'Northgate Athletic', 'Port FC', 'Crown Town', 'Westbrook Rovers'];

      // Notify user if relegated
      const userWasRelegated = relegatedIds.has(nextActiveUserClubId);
      if (userWasRelegated) {
        addNotification({
          type: 'general',
          title: '⚠️ Relegation',
          body: `Your club has been relegated. Compete at a lower level next season.`,
        });
      }

      // 4. Regenerate entirely fresh weekly rosters
      const teamIds = afterRelegation.map((c) => c.id);
      const leagueClubs = teamIds.slice(0, 20);
      // Swap relegated IDs reference for fixture generation (use afterRelegation)
      const postRelegationClubs = afterRelegation;


      const resetFixtures = generateLeagueFixtures20(leagueClubs);
      const resetTournamentFixtures =
        generateTournamentGroupFixtures(resetStatsClubs);
      const resetBracket: BracketNode[] = [];

      // 5. Update state parameters
      setAllClubs(postRelegationClubs);
      setLeagueFixtures(resetFixtures);
      setTournamentFixtures(resetTournamentFixtures);
      setCupBracket(resetBracket);
      setCurrentWeek(1);
      setCurrentCupRound("Group");

      const newManagerSkills = { ...managerSkills, xp: managerSkills.xp + 500 };
      if (newManagerSkills.xp >= newManagerSkills.level * 1000) {
        newManagerSkills.level += 1;
        newManagerSkills.skillPoints += 1;
        newManagerSkills.xp = 0;
      }
      setManagerSkills(newManagerSkills);

      const newNews = [
        {
          id: `news-${Date.now()}-${randRange(100, 999)}`,
          week: 1,
          type: "transfer" as const,
          headline: `New Season Begins! Multiple clubs announce signing of highly-rated academy Wonderkids!`,
        },
        ...newsFeed,
      ].slice(0, 30);
      setNewsFeed(newNews);

      // 6. Save slots
      saveCurrentSlotProgress(
        resetStatsClubs,
        resetFixtures,
        resetBracket,
        1,
        "Group",
        balanceAfterPrize,
        resetTournamentFixtures,
        nextTrophies,
        newManagerSkills,
        newNews,
      );
      setSimMessage(`${feedbackMsg} Season prize money: $${prizeMoney.toLocaleString()}`);
      setConsecutiveLosses(0);
    } else {
      handleHardReset();
    }
    setCurrentTabProgress("MANAGER");
  };

  // Render Selection of career profiles if slot is empty
  if (!activeSlotId) {
    return (
      <div className="min-h-screen w-screen bg-[#07090d] text-slate-200 p-6 md:p-12 flex flex-col items-center justify-center text-left select-none relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-950/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-4xl w-full space-y-8 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.25)] mx-auto border border-white/10">
              <Trophy className="text-black font-black w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              SportSim{" "}
              <span className="text-sky-400 font-extrabold italic bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-400/20">
                Pro
              </span>
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              Immersive Football Club Management Dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Create Slot Console */}
            <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-md font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-400" />
                Initialize New Tactical Career Slot
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    First Team Manager Surname:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter surname (e.g. Ferguson)..."
                    value={newManagerName}
                    onChange={(e) => setNewManagerName(e.target.value)}
                    className="w-full bg-[#1c2230] border border-white/10 p-3 rounded-xl text-white text-xs font-semibold focus:border-sky-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    Assign Initial Club:
                  </label>
                  <select
                    value={newSelectedClubId}
                    onChange={(e) => setNewSelectedClubId(e.target.value)}
                    className="w-full bg-[#1c2230] border border-white/10 p-3 rounded-xl text-white text-xs font-semibold outline-none focus:border-sky-500 transition-all cursor-pointer"
                  >
                    <option value="club-1">Crestwood United (OVR: 86)</option>
                    <option value="club-2">Kingsbury FC (OVR: 86)</option>
                    <option value="club-3">Skywards City (OVR: 84)</option>
                    <option value="club-4">Meridian Ath (OVR: 85)</option>
                    <option value="club-5">Solaris Wanderers (OVR: 80)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    Campaign Operations Mode:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "dual" as const,
                        title: "Pro Dual",
                        desc: "League + Cups",
                      },
                      {
                        id: "league" as const,
                        title: "SuperLeague Only",
                        desc: "19 weeks",
                      },
                      {
                        id: "cup" as const,
                        title: "Cup Only",
                        desc: "Knockout",
                      },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setNewCampaignType(mode.id)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          newCampaignType === mode.id
                            ? "bg-sky-500 text-black border-sky-400 font-bold"
                            : "bg-slate-900 text-slate-400 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <span className="text-xs block font-bold">
                          {mode.title}
                        </span>
                        <span className="text-[8px] opacity-70 block mt-0.5">
                          {mode.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateSaveSlot}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-450 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:scale-[1.01] transition-all cursor-pointer shadow-md"
                >
                  START FIRST MATCHDAY WEEK
                </button>
              </div>
            </div>

            {/* List Existing Slots */}
            <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-md font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-450" />
                  Select Career Profile Database
                </h2>

                {saveSlots.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-mono italic border border-dashed border-white/5 rounded-xl">
                    No registered career profiles found. Create a profile on the
                    left to start!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {saveSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => setActiveSlotId(slot.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-sky-500/40 p-3.5 rounded-xl flex justify-between items-center transition-all cursor-pointer group"
                      >
                        <div>
                          <h4 className="text-xs font-black uppercase text-white tracking-tight">
                            {slot.managerName}
                          </h4>
                          <div className="flex gap-2 text-[9px] font-mono text-slate-450 mt-1 uppercase">
                            <span>
                              Club:{" "}
                              <strong>
                                {slot.allClubs.find((c) => c.id === slot.clubId)
                                  ?.name || "Crestwood"}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Mode: <strong>{slot.campaignType}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Wk: <strong>{slot.currentWeek}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span title="Delete Save">
                            <Trash2
                              onClick={(e) => promptDeleteSaveSlot(slot.id, e)}
                              className="w-4 h-4 text-rose-500 hover:text-rose-400 opacity-60 hover:opacity-100 shrink-0 cursor-pointer"
                            />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal border-t border-white/5 pt-3">
                All data is synchronized inside your browser. No third party
                platforms can audit your progress records dynamically.
              </p>
            </div>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {saveToDelete && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn text-center">
            <div className="bg-[#121620] border border-white/10 w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl relative p-8">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <Trash2 className="w-8 h-8 text-rose-500 stroke-[1.5px]" />
              </div>

              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-3">
                Delete Profile?
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-8">
                Are you sure you want to delete this career profile? This action
                will permanently erase all associated match records, player
                progression, and facility upgrades. This operation cannot be
                reversed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteSaveSlot}
                  className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Return safely
                </button>
                <button
                  onClick={confirmDeleteSaveSlot}
                  className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
                >
                  Yes, Erase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#090b0f] text-slate-200 font-sans overflow-hidden select-none text-left">
      <AppNav
        currentTab={currentTabProgress as any}
        onTabChange={(tab) => setCurrentTabProgress(tab as any)}
        onLogOut={() => setActiveSlotId(null)}
        activeSimulation={activeSimulation}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AppHeader
          managerName={managerName}
          currentWeek={currentWeek}
          userBalance={userBalance}
          userClub={currentActiveUserClub}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        />

        {/* STATUS BANNER */}
        {simMessage && (
          <div className="bg-emerald-950/40 border-y border-emerald-500/20 text-emerald-350 px-6 py-2 text-[11px] font-bold flex items-center gap-2 animate-fadeIn uppercase tracking-wider shrink-0 transition-all">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-spin-slow" />
            <span>{simMessage}</span>
          </div>
        )}

        {/* MAIN PANEL CONTENT VIEW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#090b0f] pb-20 lg:pb-8">
          {currentTabProgress === "MANAGER" && (
            <ManagerSuite
              userClub={currentActiveUserClub}
              allClubs={allClubs}
              userBalance={userBalance}
              onUpgradeFacilities={handleUpgradeFacilities}
              onBuyPlayer={handleBuyPlayer}
              onSellPlayer={handleSellPlayer}
              onAdjustSquadLineup={handleAdjustSquadLineup}
              onAddFunds={handleAddFunds}
              onTapPlayer={handleOpenPlayerDossier}
              onChangeUserMentality={handleTacticalShift}
              onChangeUserFormation={handleFormationShift}
              onChangeUserPlaystyle={handlePlaystyleShift}
              onPromoteYouth={handlePromoteYouth}
              onSellYouth={handleSellYouth}
              onSignYouthToAcademy={handleSignYouthToAcademy}
              onTogglePlayerFocus={handleTogglePlayerFocus}
              onAssignCoachToPlayer={handleAssignCoachToPlayer}
              onBuyCoach={handleBuyCoach}
              onDismissCoach={handleDismissCoach}
              managerName={managerName}
              currentWeek={currentWeek}
              managerSkills={managerSkills}
              onUpgradeSkill={(skill) => {
                if (managerSkills.skillPoints > 0) {
                  setManagerSkills({
                    ...managerSkills,
                    [skill]: managerSkills[skill] + 1,
                    skillPoints: managerSkills.skillPoints - 1,
                  });
                }
              }}
              transferMarketState={transferMarketState}
              boardState={boardState}
              onUpdateTransferMarketState={setTransferMarketState}
              onAddNotification={(title, body) => addNotification({ type: 'transfer', title, body })}
            />
          )}

          {currentTabProgress === "NEXT_MATCH" && (
            <NextMatch
              userClub={currentActiveUserClub}
              allClubs={allClubs}
              campaignType={campaignType}
              currentWeek={currentWeek}
              currentCupRound={currentCupRound}
              leagueFixtures={leagueFixtures}
              tournamentFixtures={tournamentFixtures || []}
              cupBracket={cupBracket}
              onStartMatch={(fixtureId, homeId, awayId) => {
                handleInitiateLiveSimulation(fixtureId, homeId, awayId, false);
              }}
              onQuickSimMatch={(fixtureId, homeId, awayId) => {
                handleQuickSimulateMatch(fixtureId, homeId, awayId);
              }}
              onAdvanceWeek={handleAdvanceCampaignWeek}
              onTapClub={handleOpenClubDossier}
              onTapPlayer={handleOpenPlayerDossier}
              userMentality={currentActiveUserClub.mentality}
              onChangeUserMentality={handleTacticalShift}
              activeMatchesToPlay={activeMatchesToPlay}
            />
          )}

          {currentTabProgress === "FIXTURES" && (
            <FixturesPage
              activeSimulation={activeSimulation}
              allClubs={allClubs}
              userClubId={userClubId}
              currentWeek={currentWeek}
              campaignType={campaignType}
              fixturesActiveSubTab={fixturesActiveSubTab}
              onSetFixturesTab={setFixturesActiveSubTab}
              leagueFixtures={leagueFixtures}
              tournamentFixtures={tournamentFixtures || []}
              cupBracket={cupBracket}
              currentCupRound={currentCupRound}
              currentActiveUserClub={currentActiveUserClub}
              activeMatchesToPlay={activeMatchesToPlay}
              isPlaying={isPlaying}
              simSpeed={simSpeed}
              onSkipOrQuickSim={handleSkipOrQuickSim}
              onAdvanceCampaignWeek={handleAdvanceCampaignWeek}
              onSimulateAllRemainingMatches={handleSimulateAllRemainingMatches}
              onInitiateLiveSimulation={handleInitiateLiveSimulation}
              onProgressSimOneTick={handleProgressSimOneTick}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSetSpeed={setSimSpeed}
              onTacticalShift={handleTacticalShift}
              onPlaystyleShift={handlePlaystyleShift}
              onFormationShift={handleFormationShift}
              onOpenPlayerDossier={handleOpenPlayerDossier}
              onOpenClubDossier={handleOpenClubDossier}
              onAdjustSquadLineup={handleAdjustSquadLineup}
              onCloseMatch={() => setActiveSimulation(null)}
            />
          )}

          {currentTabProgress === "STANDINGS" && (
            <LeagueTable
              allClubs={allClubs}
              fixtures={leagueFixtures}
              currentWeek={currentWeek}
              userClubId={userClubId}
              onTapPlayer={handleOpenPlayerDossier}
              onTapClub={handleOpenClubDossier}
              tournamentFixtures={tournamentFixtures}
              cupBracket={cupBracket}
              currentCupRound={currentCupRound}
              onAdvanceWeek={
                activeMatchesToPlay.length === 0
                  ? handleAdvanceCampaignWeek
                  : undefined
              }
            />
          )}

          {currentTabProgress === "ANALYTICS" && (
            <AnalyticsCenter
              allClubs={allClubs}
              leagueFixtures={leagueFixtures}
              tournamentFixtures={tournamentFixtures || []}
              onTapPlayer={handleOpenPlayerDossier}
              onTapClub={handleOpenClubDossier}
            />
          )}

          {currentTabProgress === "NEWS" && (
            <NewsPage newsFeed={newsFeed} />
          )}

          {currentTabProgress === "ALL_TEAMS" && (
            <AllTeams
              allClubs={allClubs}
              onTapClub={handleOpenClubDossier}
              onTakeoverClub={handleTakeoverClub}
              userClubId={userClubId}
              userBalance={userBalance}
            />
          )}

          {currentTabProgress === "TROPHIES" && (
            <TrophiesCenter historyTrophies={historyTrophies} />
          )}

          {currentTabProgress === "BOARD" && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Board Room</h2>
                <p className="text-gray-400 text-xs mt-1">Season objectives and board confidence</p>
              </div>
              <BoardObjectives boardState={boardState} currentWeek={currentWeek} />
            </div>
          )}

          {currentTabProgress === "FINANCES" && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Financial Centre</h2>
                <p className="text-gray-400 text-xs mt-1">Revenue, expenses, and transfer balance</p>
              </div>
              {/* Sub-tab switcher */}
              <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1 mb-4">
                <button
                  onClick={() => setFinancesSubTab('overview')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${financesSubTab === 'overview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setFinancesSubTab('transfers')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${financesSubTab === 'transfers' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Transfer Window
                </button>
              </div>
              {financesSubTab === 'overview' && (
                <FinancialDashboard
                  ledger={financialLedger}
                  userClub={currentActiveUserClub}
                  userBalance={userBalance}
                  currentWeek={currentWeek}
                />
              )}
              {financesSubTab === 'transfers' && (
                <TransferMarketWindow
                  marketPool={getTransferMarketPool().filter((p) => !currentActiveUserClub.squad.some((s) => s.id === p.id))}
                  userClub={currentActiveUserClub}
                  allClubs={allClubs}
                  userBalance={userBalance}
                  currentWeek={currentWeek}
                  marketState={transferMarketState}
                  onUpdateMarketState={setTransferMarketState}
                  onBuyPlayer={handleBuyPlayer}
                  onSellPlayer={handleSellPlayer}
                  onAddNotification={(title, body) => addNotification({ type: 'transfer', title, body })}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* DOSSIER & EVENT MODALS */}
      {pendingMoraleEvents.length > 0 && (
        <MoraleEventModal
          player={pendingMoraleEvents[0]}
          onDecision={handleMoraleDecision}
        />
      )}

      {dossierPlayer && (
        <PlayerDossierModal
          player={dossierPlayer}
          isOwnTeam={currentActiveUserClub?.squad.some(
            (p) => p.id === dossierPlayer.id,
          )}
          onClose={() => setActivePlayerDossierId(null)}
        />
      )}

      {dossierClub && (
        <ClubDossierModal
          club={dossierClub}
          leagueFixtures={leagueFixtures}
          tournamentFixtures={tournamentFixtures}
          onClose={() => setActiveClubDossierId(null)}
          onOpenPlayerDossier={handleOpenPlayerDossier}
        />
      )}

      {isHalftimeModalOpen && activeSimulation && (
        <HalftimeModal
          activeSimulation={activeSimulation}
          allClubs={allClubs}
          onClose={() => setIsHalftimeModalOpen(false)}
          onResume={() => { setIsHalftimeModalOpen(false); setIsPlaying(true); }}
          onMessage={(msg) => { setSimMessage(msg); setTimeout(() => setSimMessage(""), 3000); }}
        />
      )}

      {isSeasonReviewOpen && (
        <SeasonReviewModal
          userClub={currentActiveUserClub!}
          balance={userBalance}
          onResolve={handleSeasonResolution}
        />
      )}

      {postMatchAnalysis && !isSeasonReviewOpen && (
        <PostMatchModal
          analysis={postMatchAnalysis}
          homeClub={allClubs.find(c => c.id === postMatchAnalysis.homeClubId) || currentActiveUserClub}
          awayClub={allClubs.find(c => c.id === postMatchAnalysis.awayClubId) || currentActiveUserClub}
          onClose={() => setPostMatchAnalysis(null)}
        />
      )}

      {isNotificationDrawerOpen && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setIsNotificationDrawerOpen(false)}
          onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        />
      )}

      {showPressureModal && (
        <PressureModal
          consecutiveLosses={consecutiveLosses}
          onClose={() => setShowPressureModal(false)}
        />
      )}

      <MobileNav
        currentTab={currentTabProgress as any}
        onTabChange={(tab) => setCurrentTabProgress(tab as any)}
      />

    </div>
  );
}
