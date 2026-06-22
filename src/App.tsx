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

import { MatchCenter } from "./components/MatchCenter";
import { LeagueTable } from "./components/LeagueTable";
import { CupBracket } from "./components/CupBracket";
import { ManagerSuite } from "./components/ManagerSuite";
import { PlayerDossierModal } from "./components/PlayerDossierModal";
import { ClubDossierModal } from "./components/ClubDossierModal";
import { SeasonReviewModal } from "./components/SeasonReviewModal";
import { NextMatch } from "./components/NextMatch";
import { AnalyticsCenter } from "./components/AnalyticsCenter";
import { AllTeams } from "./components/AllTeams";
import { TrophiesCenter } from "./components/TrophiesCenter";
import { PostMatchModal } from "./components/PostMatchModal";
import { NotificationDrawer } from "./components/NotificationDrawer";

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
const START_BUDGET = 45000;

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

// 26-Week Dual Campaign Schedule (Premier League + Champions Cup concurrent alternating logic)
export const DUAL_SCHEDULE = [
  { week: 1, type: "league", label: "League Matchday 1" },
  { week: 2, type: "league", label: "League Matchday 2" },
  {
    week: 3,
    type: "tournament",
    label: "Prestige Champions Cup - Group Stage R1",
    stage: "Group",
  },
  { week: 4, type: "league", label: "League Matchday 3" },
  { week: 5, type: "league", label: "League Matchday 4" },
  {
    week: 6,
    type: "tournament",
    label: "Prestige Champions Cup - Group Stage R2",
    stage: "Group",
  },
  { week: 7, type: "league", label: "League Matchday 5" },
  { week: 8, type: "league", label: "League Matchday 6" },
  {
    week: 9,
    type: "tournament",
    label: "Prestige Champions Cup - Group Stage R3",
    stage: "Group",
  },
  { week: 10, type: "league", label: "League Matchday 7" },
  { week: 11, type: "league", label: "League Matchday 8" },
  {
    week: 12,
    type: "tournament",
    label: "Prestige Champions Cup - Round of 16",
    stage: "R16",
  },
  { week: 13, type: "league", label: "League Matchday 9" },
  { week: 14, type: "league", label: "League Matchday 10" },
  {
    week: 15,
    type: "tournament",
    label: "Prestige Champions Cup - Quarter-Finals",
    stage: "QF",
  },
  { week: 16, type: "league", label: "League Matchday 11" },
  { week: 17, type: "league", label: "League Matchday 12" },
  {
    week: 18,
    type: "tournament",
    label: "Prestige Champions Cup - Semi-Finals",
    stage: "SF",
  },
  { week: 19, type: "league", label: "League Matchday 13" },
  { week: 20, type: "league", label: "League Matchday 14" },
  {
    week: 21,
    type: "tournament",
    label: "Prestige Champions Cup - Champions Grand Final",
    stage: "F",
  },
  { week: 22, type: "league", label: "League Matchday 15" },
  { week: 23, type: "league", label: "League Matchday 16" },
  { week: 24, type: "league", label: "League Matchday 17" },
  { week: 25, type: "league", label: "League Matchday 18" },
  { week: 26, type: "league", label: "League Matchday 19" },
];

export function getTeamGroup(clubId: string, allClubs: Club[]): string {
  const idx = allClubs.findIndex((c) => c.id === clubId);
  if (idx === -1 || idx >= 32) return "None";
  const groupChar = String.fromCharCode(65 + Math.floor(idx / 4)); // Groups A-H
  return `Group ${groupChar}`;
}

export function generateWeather(): WeatherCondition {
  const roll = Math.random() * 100;
  if (roll < 40) return 'Clear Skies';
  if (roll < 60) return 'Light Rain';
  if (roll < 72) return 'Heavy Rain';
  if (roll < 82) return 'Strong Wind';
  if (roll < 90) return 'Extreme Heat';
  if (roll < 94) return 'Snow';
  if (roll < 97) return 'Night Game';
  if (roll < 99) return 'Fog';
  return 'Thunderstorm';
}

export function generateTournamentGroupFixtures(allClubs: Club[]): Fixture[] {
  const fixtures: Fixture[] = [];
  let counter = 1;
  for (let g = 0; g < 8; g++) {
    const groupTeams = allClubs.slice(g * 4, g * 4 + 4);
    if (groupTeams.length < 4) continue;
    const [t0, t1, t2, t3] = groupTeams;

    // Week 3
    fixtures.push({
      id: `cup-g1-${counter++}`,
      week: 3,
      homeClubId: t0.id,
      awayClubId: t1.id,
      isCompleted: false,
      weather: generateWeather(),
    });
    fixtures.push({
      id: `cup-g1-${counter++}`,
      week: 3,
      homeClubId: t2.id,
      awayClubId: t3.id,
      isCompleted: false,
      weather: generateWeather(),
    });

    // Week 6
    fixtures.push({
      id: `cup-g2-${counter++}`,
      week: 6,
      homeClubId: t0.id,
      awayClubId: t2.id,
      isCompleted: false,
      weather: generateWeather(),
    });
    fixtures.push({
      id: `cup-g2-${counter++}`,
      week: 6,
      homeClubId: t1.id,
      awayClubId: t3.id,
      isCompleted: false,
      weather: generateWeather(),
    });

    // Week 9
    fixtures.push({
      id: `cup-g3-${counter++}`,
      week: 9,
      homeClubId: t0.id,
      awayClubId: t3.id,
      isCompleted: false,
      weather: generateWeather(),
    });
    fixtures.push({
      id: `cup-g3-${counter++}`,
      week: 9,
      homeClubId: t1.id,
      awayClubId: t2.id,
      isCompleted: false,
      weather: generateWeather(),
    });
  }
  return fixtures;
}

export function generateCupBracket16FromGroups(
  qualifiers: string[],
): BracketNode[] {
  const list: BracketNode[] = [];
  // R16 (8 matches)
  for (let i = 1; i <= 8; i++) {
    list.push({
      id: `R16-${i}`,
      round: "R16",
      roundIndex: i - 1,
      homeClubId: qualifiers[2 * i - 2] || undefined,
      awayClubId: qualifiers[2 * i - 1] || undefined,
      isCompleted: false,
    });
  }
  // QF (4 matches)
  for (let i = 1; i <= 4; i++) {
    list.push({
      id: `QF-${i}`,
      round: "QF",
      roundIndex: i - 1,
      isCompleted: false,
    });
  }
  // SF (2 matches)
  for (let i = 1; i <= 2; i++) {
    list.push({
      id: `SF-${i}`,
      round: "SF",
      roundIndex: i - 1,
      isCompleted: false,
    });
  }
  // Final (1 match)
  list.push({ id: `F-1`, round: "F", roundIndex: 0, isCompleted: false });
  return list;
}

export function getGroupStandingsForGroup(
  groupIndex: number,
  allClubs: Club[],
  tournamentFixtures: Fixture[],
) {
  const groupTeams = allClubs.slice(groupIndex * 4, groupIndex * 4 + 4);
  const standings = groupTeams.map((club) => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let points = 0;

    tournamentFixtures.forEach((f) => {
      if (!f.isCompleted) return;
      if (f.homeClubId === club.id) {
        played++;
        goalsFor += f.homeScore || 0;
        goalsAgainst += f.awayScore || 0;
        if ((f.homeScore || 0) > (f.awayScore || 0)) {
          won++;
          points += 3;
        } else if ((f.homeScore || 0) < (f.awayScore || 0)) {
          lost++;
        } else {
          drawn++;
          points += 1;
        }
      } else if (f.awayClubId === club.id) {
        played++;
        goalsFor += f.awayScore || 0;
        goalsAgainst += f.homeScore || 0;
        if ((f.awayScore || 0) > (f.homeScore || 0)) {
          won++;
          points += 3;
        } else if ((f.awayScore || 0) < (f.homeScore || 0)) {
          lost++;
        } else {
          drawn++;
          points += 1;
        }
      }
    });

    return {
      club,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points,
    };
  });

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

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
  >("MANAGER");
  const [fixturesActiveSubTab, setFixturesActiveSubTab] = useState<
    "LEAGUE" | "TOURNAMENT"
  >("LEAGUE");

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

  // v2: Media pressure (consecutive losses)
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [showPressureModal, setShowPressureModal] = useState<boolean>(false);

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
        name: "Placeholder Coach",
        nationality: "N/A",
        specialty: "Tactics" as any,
        rating: 50,
      },
      mentality: "Balanced" as TeamMentalityType,
      trainingFacilities: 1,
      tacticsFacilities: 1,
      cardioFacilities: 1,
      medicalFacilities: 1,
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
    facilityType: "training" | "tactics" | "cardio" | "medical",
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
        }
      }
      return c;
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
    saveCurrentSlotProgress(
      updated,
      undefined,
      undefined,
      undefined,
      undefined,
      nextBalance,
    );
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
        let focusedCount = 0;
        club.squad.forEach((p) => {
          if (p.focusedCoachId) focusedCount++;
        });

        const playerToUpdate = club.squad.find((p) => p.id === playerId);
        const wasFocusedBefore = playerToUpdate && playerToUpdate.focusedCoachId;

        if (coachId && !wasFocusedBefore && focusedCount >= 6) {
          return club; // Can't focus more than 6
        }

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

    const fixtureObject = quickSimulateFixture(h, a);

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

    const fixtureObject = quickSimulateFixture(h, a);
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

    // Generate News
    const newNewsItems: NewsItem[] = [];
    if (Math.random() > 0.5) {
      const randClub = updatedClubs[randRange(0, updatedClubs.length - 1)];
      const wonRecent = randClub.streak[randClub.streak.length - 1] === "W";
      if (wonRecent) {
        newNewsItems.push({
          id: `news-${Date.now()}-${randRange(100, 999)}`,
          week: currentWeek,
          type: "match",
          headline: `${randClub.name} Fans Ecstatic After Massive Weekend Win!`,
        });
      } else {
        newNewsItems.push({
          id: `news-${Date.now()}-${randRange(100, 999)}`,
          week: currentWeek,
          type: "general",
          headline: `Manager Under Pressure After ${randClub.name} Fail To Deliver`,
        });
      }
    }
    if (Math.random() > 0.7) {
      const randClub = updatedClubs[randRange(0, updatedClubs.length - 1)];
      const randPlayer =
        randClub.squad[randRange(0, randClub.squad.length - 1)];
      newNewsItems.push({
        id: `news-${Date.now()}-${randRange(100, 999)}`,
        week: currentWeek,
        type: "injury",
        headline: `Injury Blow For ${randClub.name}: ${randPlayer.name} Limps Off The Pitch.`,
      });
    }

    const nextWeek = currentWeek + 1;
    let nextNews = [...newNewsItems, ...newsFeed].slice(0, 30); // Keep max 30 news
    setNewsFeed(nextNews);
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
            const res = quickSimulateFixture(mHome, mAway);

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
            const res = quickSimulateFixture(mHome, mAway);

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
  const handleOpenPlayerDossier = (id: string) => {
    setActivePlayerDossierId(id);
    setActiveClubDossierId(null);
  };

  const handleOpenClubDossier = (id: string) => {
    setActiveClubDossierId(id);
    setActivePlayerDossierId(null);
  };

  // Find referenced models for Dossier Modal
  const getDossierPlayerModel = (): Player | null => {
    if (!activePlayerDossierId) return null;
    for (const club of allClubs) {
      const match = club.squad.find((p) => p.id === activePlayerDossierId);
      if (match) return match;
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
        let currentSquad = c.squad.map((p) => ({
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

      // 4. Regenerate entirely fresh weekly rosters
      const teamIds = resetStatsClubs.map((c) => c.id);
      const leagueClubs = teamIds.slice(0, 20);

      const resetFixtures = generateLeagueFixtures20(leagueClubs);
      const resetTournamentFixtures =
        generateTournamentGroupFixtures(resetStatsClubs);
      const resetBracket: BracketNode[] = [];

      // 5. Update state parameters
      setAllClubs(resetStatsClubs);
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
                          <Trash2
                            onClick={(e) => promptDeleteSaveSlot(slot.id, e)}
                            className="w-4 h-4 text-rose-500 hover:text-rose-400 opacity-60 hover:opacity-100 shrink-0 cursor-pointer"
                            title="Delete Save"
                          />
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
      {/* 1. LEFT SIDEBAR: PREMIUM OPERATIONS NAVIGATION — hidden on mobile */}
      <nav
        id="sidebar-rail"
        className="hidden lg:flex w-20 xl:w-24 flex-col items-center py-6 border-r border-white/10 bg-[#0c0f16] justify-between z-10 shrink-0"
      >
        <div className="flex flex-col items-center gap-8 w-full">
          {/* LOGO */}
          <div
            onClick={() => setActiveSlotId(null)}
            className="w-12 h-12 bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)] cursor-pointer"
            title="Return to Career Selection Grid"
          >
            <Trophy className="text-black font-black w-6 h-6 shrink-0" />
          </div>

          {/* SIDER BAR LIST */}
          <div className="flex flex-col gap-3 w-full px-2">
            {[
              {
                id: "MANAGER" as const,
                label: "Manager Suite",
                icon: Briefcase,
              },
              {
                id: "NEXT_MATCH" as const,
                label: "Next Match",
                icon: Zap,
                notify: activeSimulation ? "LIVE" : undefined,
              },
              { id: "FIXTURES" as const, label: "Fixtures", icon: Calendar },
              { id: "STANDINGS" as const, label: "Standings", icon: Award },
              {
                id: "ANALYTICS" as const,
                label: "League Leaders",
                icon: BarChart3,
              },
              { id: "NEWS" as const, label: "Media Feed", icon: Globe },
              { id: "ALL_TEAMS" as const, label: "All Teams", icon: Globe },
              {
                id: "TROPHIES" as const,
                label: "Cabinet/Trophies",
                icon: Trophy,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = currentTabProgress === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTabProgress(item.id)}
                  className={`flex flex-col items-center py-2.5 rounded-xl transition-all relative cursor-pointer w-full group ${
                    isSelected
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black font-mono"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-[8px] mt-1 font-bold uppercase tracking-widest text-center hidden md:block scale-90">
                    {item.label.split(" ")[0]}
                  </span>

                  {item.notify && (
                    <span className="absolute top-1 right-2 w-5 text-center bg-red-500 text-black font-mono font-black text-[7px] py-[2px] rounded-full animate-pulse uppercase">
                      {item.notify}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LOG OUT SAVE SLOT */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveSlotId(null)}
            className="px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/5 cursor-pointer text-[9px] uppercase font-bold text-center font-mono"
            title="Log Out to save Slot career profile"
          >
            SAVES
          </button>
        </div>
      </nav>

      {/* 2. RIGHT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER TOP DISPLAY */}
        <header className="h-20 flex items-center justify-between px-6 bg-[#0c0f16] border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white uppercase flex items-center gap-1">
                SportSim{" "}
                <span className="text-sky-400 text-opacity-100 font-extrabold italic bg-sky-500/5 px-2 py-0.5 rounded border border-sky-400/10">
                  Pro
                </span>
              </h1>
              <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-0.5 flex items-center gap-1">
                <span>First Team Operations Manager Console</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded uppercase">
                  Dual Season Active
                </span>
              </div>
            </div>

            {/* Campaign Schedule Overview readout (no pills/buttons selection) */}
            <div className="bg-slate-900 border border-white/5 p-2 rounded-xl flex items-center gap-2.5 ml-6 text-xs text-slate-350">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">
                CURRENT ROUND STATUS:
              </span>
              <span className="text-[11px] text-white font-mono font-black uppercase">
                Week {currentWeek} / 26
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-[11px] text-[#facc15] font-bold uppercase tracking-wide">
                {DUAL_SCHEDULE[currentWeek - 1]?.label ||
                  `League Matchday ${currentWeek}`}
              </span>
            </div>
          </div>

          {/* RIGHT BALANCE DISPLAY HUD AND USER CREST */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] uppercase text-slate-500 font-bold tracking-widest mb-0.5 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-emerald-400" />
                Budget
              </span>
              <span className="text-emerald-400 font-mono font-black text-xl leading-none">
                ${userBalance.toLocaleString()}
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-black font-black text-[8px] flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-inner border border-white/15"
                style={{
                  backgroundColor: `${currentActiveUserClub.color}25`,
                  color: currentActiveUserClub.color,
                }}
              >
                {currentActiveUserClub.name.substring(0, 2)}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-white text-xs font-black block">
                  {managerName}
                </span>
                <span className="text-[9px] text-[#94a3b8] block uppercase font-mono tracking-wider">
                  {currentActiveUserClub.name}
                </span>
              </div>
            </div>
          </div>
        </header>

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
              onSignYouthToAcademy={handleSignYouthToAcademy}
              onTogglePlayerFocus={handleTogglePlayerFocus}
              onAssignCoachToPlayer={handleAssignCoachToPlayer}
              onBuyCoach={handleBuyCoach}
              onDismissCoach={handleDismissCoach}
              managerName={managerName}
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
            <div>
              {activeSimulation ? (
                <div className="space-y-4">
                  {/* Skip Header Banner */}
                  <div className="bg-[#121620] border border-white/10 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs leading-none">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">
                      ⚡ Want to instantly simulated results? Complete this game
                      with a single tab:
                    </span>
                    <button
                      onClick={handleSkipOrQuickSim}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-black font-extrabold uppercase rounded-lg cursor-pointer text-[10px] tracking-wider transition-all"
                    >
                      Instant Simulated Match Result
                    </button>
                  </div>

                  <MatchCenter
                    simulation={activeSimulation}
                    homeClub={
                      allClubs.find(
                        (c) => c.id === activeSimulation.homeClubId,
                      )!
                    }
                    awayClub={
                      allClubs.find(
                        (c) => c.id === activeSimulation.awayClubId,
                      )!
                    }
                    isPlaying={isPlaying}
                    simSpeed={simSpeed}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onStepSimulation={handleProgressSimOneTick}
                    onSetSpeed={setSimSpeed}
                    onChangeUserMentality={handleTacticalShift}
                    onChangeUserPlaystyle={handlePlaystyleShift}
                    onChangeUserFormation={handleFormationShift}
                    userClubId={userClubId}
                    onTapPlayer={handleOpenPlayerDossier}
                    onTapClub={handleOpenClubDossier}
                    onAdjustSquadLineup={handleAdjustSquadLineup}
                    onCloseMatch={() => setActiveSimulation(null)}
                  />
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-[#121620] border border-white/10 rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow">
                        <Tv className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-md font-black text-white uppercase tracking-tight">
                          Campaign Fixtures & Broadcast deck
                        </h2>
                        <p className="text-xs text-slate-400">
                          Launch real-time interactive match servers. Manage
                          user matchday lineups, or spectate any CPU fixture
                          live!
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-xl font-mono text-center shrink-0">
                      <span className="text-[9px] uppercase text-slate-500 block leading-none font-bold">
                        CURRENT CAMPAIGN ROUND
                      </span>
                      <span className="text-xs font-black text-sky-400 uppercase mt-1 block">
                        WEEK {currentWeek} / 26
                      </span>
                    </div>
                  </div>

                  {campaignType === "dual" && (
                    <div className="flex gap-2 p-1 bg-slate-950/80 border border-white/5 rounded-xl w-fit">
                      <button
                        onClick={() => setFixturesActiveSubTab("LEAGUE")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          fixturesActiveSubTab === "LEAGUE"
                            ? "bg-sky-500 text-black shadow font-extrabold"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        League Matchdays
                      </button>
                      <button
                        onClick={() => setFixturesActiveSubTab("TOURNAMENT")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          fixturesActiveSubTab === "TOURNAMENT"
                            ? "bg-amber-500 text-black shadow font-extrabold"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        Prestige Cup
                      </button>
                    </div>
                  )}

                  {activeMatchesToPlay.length === 0 ? (
                    <div className="p-8 text-center space-y-4">
                      <div className="py-5 bg-black/40 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce mb-1" />
                        <span>
                          All fixtures completed for this session round!
                        </span>
                      </div>

                      <button
                        onClick={handleAdvanceCampaignWeek}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow"
                      >
                        Advance to Week {currentWeek + 1}
                      </button>
                    </div>
                  ) : campaignType === "dual" &&
                    fixturesActiveSubTab === "LEAGUE" &&
                    !(
                      DUAL_SCHEDULE.find((s) => s.week === currentWeek)
                        ?.type === "league"
                    ) ? (
                    (() => {
                      let nextLgMatch = leagueFixtures?.find(
                        (f) =>
                          !f.isCompleted &&
                          (f.homeClubId === currentActiveUserClub?.id ||
                            f.awayClubId === currentActiveUserClub?.id),
                      );
                      let nextLgOpponentName = "";
                      let nextLgWeek = "";
                      if (nextLgMatch) {
                        const oppId =
                          nextLgMatch.homeClubId === currentActiveUserClub?.id
                            ? nextLgMatch.awayClubId
                            : nextLgMatch.homeClubId;
                        const opp = allClubs.find((c) => c.id === oppId);
                        nextLgOpponentName = opp?.name || "Unknown";
                        nextLgWeek = `Week ${nextLgMatch.week}`;
                      }
                      return (
                        <div className="bg-[#121620] border border-white/5 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
                          <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center mx-auto border border-sky-400/20">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                              No League Fixtures Scheduled
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Week {currentWeek} is designated for the{" "}
                              <strong>Prestige Champions Cup</strong> tournament
                              stage.
                            </p>

                            {nextLgMatch ? (
                              <div className="my-4 bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl text-left inline-block min-w-48">
                                <span className="text-[10px] text-sky-400 font-mono uppercase font-black block mb-1 tracking-widest">
                                  Next League Match:
                                </span>
                                <div className="text-white text-sm font-black uppercase tracking-tight">
                                  vs {nextLgOpponentName}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  Scheduled for{" "}
                                  <strong className="text-white">
                                    {nextLgWeek}
                                  </strong>
                                </div>
                              </div>
                            ) : (
                              <div className="my-4 text-xs text-slate-500 bg-white/5 p-3 rounded-xl border border-white/10 uppercase tracking-widest font-mono font-bold">
                                No Upcoming League Matches
                              </div>
                            )}

                            <p className="text-xs text-slate-400 mt-4 block">
                              Select the{" "}
                              <strong className="text-amber-400">
                                Prestige Cup
                              </strong>{" "}
                              sub-tab above to play tournament fixtures of the
                              week!
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : campaignType === "dual" &&
                    fixturesActiveSubTab === "TOURNAMENT" &&
                    DUAL_SCHEDULE.find((s) => s.week === currentWeek)?.type ===
                      "league" ? (
                    (() => {
                      let nextCupMatch = tournamentFixtures?.find(
                        (f) =>
                          !f.isCompleted &&
                          (f.homeClubId === currentActiveUserClub?.id ||
                            f.awayClubId === currentActiveUserClub?.id),
                      );
                      let nextKnockoutMatch = cupBracket?.find(
                        (n) =>
                          !n.isCompleted &&
                          (n.homeClubId === currentActiveUserClub?.id ||
                            n.awayClubId === currentActiveUserClub?.id),
                      );
                      let combinedNext = nextCupMatch || nextKnockoutMatch;

                      let nextCupOpponentName = "";
                      let nextCupWeek = "";
                      if (combinedNext) {
                        const oppId =
                          combinedNext.homeClubId === currentActiveUserClub?.id
                            ? combinedNext.awayClubId
                            : combinedNext.homeClubId;
                        const opp = allClubs.find((c) => c.id === oppId);
                        nextCupOpponentName =
                          opp?.name || "TBD (Awaiting Draw)";

                        if ("week" in combinedNext) {
                          nextCupWeek = `Week ${(combinedNext as Fixture).week}`;
                        } else {
                          const schedInfo = DUAL_SCHEDULE.find(
                            (s) =>
                              s.stage === (combinedNext as BracketNode).round,
                          );
                          nextCupWeek = schedInfo
                            ? `Week ${schedInfo.week}`
                            : "TBD";
                        }
                      }

                      return (
                        <div className="bg-[#121620] border border-white/5 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
                          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto border border-amber-400/20">
                            <Award className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                              No Prestige Cup Fixtures Scheduled
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Week {currentWeek} is designated for local{" "}
                              <strong>Elite SuperLeague</strong> league matches.
                            </p>

                            {combinedNext ? (
                              <div className="my-4 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-left inline-block min-w-48">
                                <span className="text-[10px] text-amber-500 font-mono uppercase font-black block mb-1 tracking-widest">
                                  Next Cup Match:
                                </span>
                                <div className="text-white text-sm font-black uppercase tracking-tight">
                                  vs {nextCupOpponentName}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  Scheduled for{" "}
                                  <strong className="text-white">
                                    {nextCupWeek}
                                  </strong>
                                </div>
                              </div>
                            ) : (
                              <div className="my-4 text-xs text-slate-500 bg-white/5 p-3 rounded-xl border border-white/10 uppercase tracking-widest font-mono font-bold">
                                No Upcoming Cup Matches Remaining or knocked out
                              </div>
                            )}

                            <p className="text-xs text-slate-400 mt-4 block">
                              Select the{" "}
                              <strong className="text-sky-400">
                                League Matchdays
                              </strong>{" "}
                              sub-tab above to play league fixtures of the week!
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-900/[0.45] border border-white/5 p-4 rounded-2xl">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-black block">
                            Scheduled matches this week (
                            {campaignType === "league" ||
                            (campaignType === "dual" && currentWeek % 2 !== 0)
                              ? "League Matchday"
                              : "Prestige Champions Cup"}
                            ):
                          </span>
                          <span className="text-[9px] text-[#22c55e] font-mono uppercase bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20 inline-block font-bold">
                            {activeMatchesToPlay.length} matches pending
                          </span>
                        </div>
                        <button
                          onClick={handleSimulateAllRemainingMatches}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-450 disabled:opacity-50 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        >
                          Simulate All matches
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeMatchesToPlay.map((match) => {
                          const h = allClubs.find(
                            (c) => c.id === match.homeClubId,
                          )!;
                          const a = allClubs.find(
                            (c) => c.id === match.awayClubId,
                          )!;
                          const isUserGame =
                            h.id === userClubId || a.id === userClubId;

                          return (
                            <div
                              key={match.id}
                              className={`p-4 rounded-2xl flex flex-col justify-between border transition-all relative overflow-hidden ${
                                isUserGame
                                  ? "bg-sky-500/[0.03] border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.02)]"
                                  : "bg-white/5 border-white/5 hover:border-white/10"
                              }`}
                            >
                              {/* Glowing tag for User match */}
                              {isUserGame && (
                                <span className="absolute top-2 right-2 bg-sky-500 text-black text-[7px] font-black font-mono tracking-widest px-1.5 py-0.5 rounded-full z-10">
                                  YOUR GAME
                                </span>
                              )}

                              {/* Teams matchup */}
                              <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2 max-w-[170px]">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: h.color }}
                                    ></div>
                                    <span
                                      onClick={() =>
                                        handleOpenClubDossier(h.id)
                                      }
                                      className={`font-black truncate cursor-pointer hover:underline hover:text-sky-450 ${h.id === userClubId ? "text-sky-400" : "text-slate-200"}`}
                                    >
                                      {h.name}
                                    </span>
                                  </div>
                                  <span className="text-slate-500 font-mono text-[10px]">
                                    OVR{" "}
                                    {Math.round(
                                      h.squad.reduce(
                                        (s, p) => s + p.rating,
                                        0,
                                      ) / h.squad.length,
                                    )}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2 max-w-[170px]">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: a.color }}
                                    ></div>
                                    <span
                                      onClick={() =>
                                        handleOpenClubDossier(a.id)
                                      }
                                      className={`font-black truncate cursor-pointer hover:underline hover:text-sky-450 ${a.id === userClubId ? "text-sky-400" : "text-slate-200"}`}
                                    >
                                      {a.name}
                                    </span>
                                  </div>
                                  <span className="text-slate-500 font-mono text-[10px]">
                                    OVR{" "}
                                    {Math.round(
                                      a.squad.reduce(
                                        (s, p) => s + p.rating,
                                        0,
                                      ) / a.squad.length,
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Trigger button */}
                              {isUserGame ? (
                                <button
                                  id={`coach-your-club-${match.id}`}
                                  onClick={() =>
                                    handleInitiateLiveSimulation(
                                      match.id,
                                      h.id,
                                      a.id,
                                      false,
                                    )
                                  }
                                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-black text-[10px] tracking-wider uppercase font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Play className="w-3.5 h-3.5 fill-black" />
                                  COACH YOUR CLUB
                                </button>
                              ) : (
                                <button
                                  id={`spectate-cpu-${match.id}`}
                                  onClick={() =>
                                    handleInitiateLiveSimulation(
                                      match.id,
                                      h.id,
                                      a.id,
                                      true,
                                    )
                                  }
                                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-[10px] tracking-wider uppercase font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Play className="w-3.5 h-3.5 text-slate-400" />
                                  Spectate Live Broadcast
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
            <div className="animate-fadeIn space-y-6">
              <div className="bg-[#121620] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-sky-400" />
                  Global Sports Media Feed
                </h2>
                {newsFeed.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No news generated yet. Play some matches!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {newsFeed.map((news) => (
                      <div
                        key={news.id}
                        className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex gap-3 items-start relative overflow-hidden"
                      >
                        <div
                          className={`w-1 h-full absolute left-0 top-0 ${
                            news.type === "match"
                              ? "bg-sky-500"
                              : news.type === "transfer"
                                ? "bg-amber-500"
                                : news.type === "injury"
                                  ? "bg-red-500"
                                  : "bg-emerald-500"
                          }`}
                        />
                        <div className="flex-1 pl-2">
                          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                            Week {news.week} • {news.type}
                          </div>
                          <div className="text-sm font-bold text-slate-200">
                            {news.headline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTabProgress === "ALL_TEAMS" && (
            <AllTeams
              allClubs={allClubs}
              onTapClub={handleOpenClubDossier}
              userClubId={userClubId}
            />
          )}

          {currentTabProgress === "TROPHIES" && (
            <TrophiesCenter historyTrophies={historyTrophies} />
          )}
        </main>
      </div>

      {/* 3. DOSSIER DIALOG PORTALS (UNIVERSAL LINK POPUP) */}
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

      {/* 4. HALFTIME COACHING BOARD MODAL */}
      {isHalftimeModalOpen && activeSimulation && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn text-left">
          <div className="bg-[#121620] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex justify-between items-center">
              <div>
                <h2 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse animate-bounce" />
                  HALFTIME TEAM TALK & SUBSTITUTIONS
                </h2>
                <p className="text-[9px] text-slate-450 font-mono uppercase mt-0.5">
                  Tactical briefing panel index slot
                </p>
              </div>

              <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-center font-mono text-xs">
                <span>
                  Score:{" "}
                  <strong className="text-white font-black">
                    {activeSimulation.homeScore} - {activeSimulation.awayScore}
                  </strong>
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
              <div className="space-y-3.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono font-bold">
                  Your Locker Room Strategy:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The referee blown the whistles. Your starting players are
                  currently fatigued from 45 minutes of heavy play. Pick
                  tactical substitutes inside the Office tab after ending
                  simulation, or utilize your head coach guidelines.
                </p>
              </div>

              <div className="bg-[#1c2230] border border-white/5 p-4 rounded-xl space-y-3">
                <span className="text-[10px] text-[#f59e0b] block uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Half-Time Quick Substitution Notice
                </span>
                <p className="text-[11.5px] text-slate-400 leading-normal">
                  You can click on the buttons below to have the assistant coach
                  dynamically rotate tired players automatically for the 2nd
                  half, keeping your tactical advantage high.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border-t border-white/5 flex flex-col md:flex-row gap-3">
              <button
                onClick={() => {
                  const h = allClubs.find(
                    (c) => c.id === activeSimulation.homeClubId,
                  )!;
                  runAssistantSubstitution(h);
                  setIsHalftimeModalOpen(false);
                  setIsPlaying(true);
                  setSimMessage(
                    "Halftime substitutions deployed successfully! Commencing 2nd half.",
                  );
                  setTimeout(() => setSimMessage(""), 3000);
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Let Assistant Deploy Subs & Play
              </button>
              <button
                onClick={() => {
                  setIsHalftimeModalOpen(false);
                  setIsPlaying(true);
                }}
                className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-white border border-white/10 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Continue Play without Adjustments
              </button>
              <button
                onClick={() => {
                  setIsHalftimeModalOpen(false);
                  setIsPlaying(false);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Make Subs Myself (Live Tactics)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SEASON REVIEW AND CONTRACT PROLONGATION SCREEN */}
      {isSeasonReviewOpen && (
        <SeasonReviewModal
          userClub={currentActiveUserClub!}
          balance={userBalance}
          onResolve={handleSeasonResolution}
        />
      )}

      {/* 6. POST-MATCH ANALYSIS MODAL */}
      {postMatchAnalysis && !isSeasonReviewOpen && (
        <PostMatchModal
          analysis={postMatchAnalysis}
          homeClub={allClubs.find(c => c.id === postMatchAnalysis.homeClubId) || currentActiveUserClub}
          awayClub={allClubs.find(c => c.id === postMatchAnalysis.awayClubId) || currentActiveUserClub}
          onClose={() => setPostMatchAnalysis(null)}
        />
      )}

      {/* 7. NOTIFICATION DRAWER */}
      {isNotificationDrawerOpen && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setIsNotificationDrawerOpen(false)}
          onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        />
      )}

      {/* 8. MEDIA PRESSURE MODAL */}
      {showPressureModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121620] border border-rose-500/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-center text-lg font-black text-white uppercase tracking-tight">Board Warning</h2>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              The board is concerned about your recent form. {consecutiveLosses} consecutive defeats is unacceptable. Results must improve immediately or consequences will follow.
            </p>
            <button
              onClick={() => setShowPressureModal(false)}
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Understood — I'll Turn This Around
            </button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV — visible only on small screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f16] border-t border-white/10 flex items-stretch h-16 safe-area-inset-bottom">
        {[
          { id: 'MANAGER' as const, label: 'Manager', icon: Briefcase },
          { id: 'NEXT_MATCH' as const, label: 'Match', icon: Zap },
          { id: 'STANDINGS' as const, label: 'League', icon: Award },
          { id: 'FIXTURES' as const, label: 'Fixtures', icon: Calendar },
          { id: 'ANALYTICS' as const, label: 'Leaders', icon: BarChart3 },
        ].map(item => {
          const Icon = item.icon;
          const isActive = currentTabProgress === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTabProgress(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                isActive ? 'text-sky-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sky-400 rounded-full" />}
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
