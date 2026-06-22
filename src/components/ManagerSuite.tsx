import React, { useState } from "react";
import {
  Dumbbell,
  UserCheck,
  ShoppingCart,
  UserX,
  RefreshCw,
  Sparkles,
  Search,
  DollarSign,
  TrendingUp,
  Landmark,
  Award,
  ShieldAlert,
  Heart,
  Activity,
  ArrowLeftRight,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import {
  Club,
  Player,
  ManagerSkills,
  Coach,
  TeamFormationType,
  TeamMentalityType,
  PlaystyleType,
} from "../types";
import {
  FIRST_NAMES,
  LAST_NAMES,
  randRange,
  generatePlayerAttributes,
  generateWonderkid,
  generateUniqueCoach,
} from "../data/names";
import { SquadPitch } from "./SquadPitch";

interface ManagerSuiteProps {
  userClub: Club;
  allClubs: Club[];
  userBalance: number;
  managerName: string;
  managerSkills: ManagerSkills;
  onUpgradeSkill: (skillId: keyof ManagerSkills) => void;
  onUpgradeFacilities: (
    facilityType: "training" | "tactics" | "cardio" | "medical",
    cost: number,
  ) => void;
  onBuyPlayer: (newPlayer: Player, cost: number) => void;
  onSellPlayer: (playerId: string, value: number) => void;
  onAdjustSquadLineup?: (newSquad: Player[]) => void;
  onAddFunds?: (amount: number) => void;
  onTapPlayer?: (playerId: string) => void;
  onChangeUserMentality?: (mentality: TeamMentalityType) => void;
  onChangeUserFormation?: (formation: TeamFormationType) => void;
  onChangeUserPlaystyle?: (playstyle: PlaystyleType) => void;
  onPromoteYouth?: (playerId: string) => void;
  onSignYouthToAcademy?: (player: Player, cost: number) => void;
  onTogglePlayerFocus?: (playerId: string) => void;
  onAssignCoachToPlayer?: (playerId: string, coachId: string | null) => void;
  onBuyCoach?: (newCoach: Coach, cost: number) => void;
}

const DualStatProgress: React.FC<{ label: string; current: number; potential: number }> = ({ label, current, potential }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
        <span>{label}</span>
        <span>
          <span className="text-white font-black">{current}</span>
          <span className="text-slate-600 mx-1">➔</span>
          <span className="text-sky-400 font-extrabold">{potential} OVR POT</span>
        </span>
      </div>
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5 relative">
        {/* Potential bar background projection */}
        <div
          className="absolute left-0 top-0 h-full bg-sky-400/20 transition-all duration-500"
          style={{ width: `${potential}%` }}
        ></div>
        {/* Current bar foreground solid */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.3)]"
          style={{ width: `${current}%` }}
        ></div>
      </div>
    </div>
  );
};

export const ManagerSuite: React.FC<ManagerSuiteProps> = ({
  userClub,
  allClubs,
  userBalance,
  managerName,
  managerSkills,
  onUpgradeSkill,
  onUpgradeFacilities,
  onBuyPlayer,
  onSellPlayer,
  onAdjustSquadLineup,
  onAddFunds,
  onTapPlayer,
  onChangeUserMentality,
  onChangeUserFormation,
  onChangeUserPlaystyle,
  onPromoteYouth,
  onSignYouthToAcademy,
  onTogglePlayerFocus,
  onAssignCoachToPlayer,
  onBuyCoach,
}) => {
  // Inner states
  const [activeSubTab, setActiveSubTab] = useState<
    | "SQUAD"
    | "TRANSFERS"
    | "YOUTH"
    | "DEVELOPMENT"
    | "FACILITIES"
    | "COACHES"
    | "BOARDROOM"
    | "PROFILE"
  >("SQUAD");
  const [scoutedTransferList, setScoutedTransferList] = useState<Player[]>(() =>
    generateInitialTransferMarket(),
  );

  const [scoutedYouthList, setScoutedYouthList] = useState<Player[]>(() => {
    const list: Player[] = [];
    for (let i = 0; i < 6; i++) {
      list.push(generateWonderkid(`youth-scout-${Date.now()}-${i}`, true));
    }
    return list;
  });

  const [scoutedCoachList, setScoutedCoachList] = useState<Coach[]>(() => {
    const list: Coach[] = [];
    for (let i = 0; i < 5; i++) {
      list.push(generateUniqueCoach(20 + i)); // Offset to avoid overlapping with default active managers
    }
    return list;
  });

  const [infoMessage, setInfoMessage] = useState<string>("");

  // Filters State
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingRange, setRatingRange] = useState<string>("ALL"); // ALL, BRONZE(<75), SILVER(75-82), GOLD(83+)
  const [transferSegment, setTransferSegment] = useState<"PLAYERS" | "YOUTH" | "COACHES">("PLAYERS");

  // Boardroom interactions state
  const [boardBackingRequested, setBoardBackingRequested] =
    useState<boolean>(false);
  const [boardBackingResult, setBoardBackingResult] = useState<string>("");
  const [requestedAmount, setRequestedAmount] = useState<number>(3000000);
  const [boardBackingCount, setBoardBackingCount] = useState<number>(0);

  // Generate unique transfer players based on globally verified ranges
  function generateInitialTransferMarket(): Player[] {
    const list: Player[] = [];

    // 1. Analyze user squad limits
    const squadGK = userClub?.squad
      ? userClub.squad.filter((p) => p.position === "GK").length
      : 1;
    const squadDEF = userClub?.squad
      ? userClub.squad.filter((p) => p.position === "DEF").length
      : 4;
    const squadMID = userClub?.squad
      ? userClub.squad.filter((p) => p.position === "MID").length
      : 4;
    const squadATT = userClub?.squad
      ? userClub.squad.filter((p) => p.position === "ATT").length
      : 2;

    // Use an expanded market size of 25 players
    const totalMarketSize = 25;
    const neededPositions: ("GK" | "DEF" | "MID" | "ATT")[] = [];

    if (squadGK <= 1) {
      neededPositions.push("GK", "GK", "GK", "GK");
    }
    if (squadDEF < 5) {
      neededPositions.push("DEF", "DEF", "DEF", "DEF", "DEF", "DEF");
    }
    if (squadMID < 5) {
      neededPositions.push("MID", "MID", "MID", "MID", "MID", "MID");
    }
    if (squadATT < 3) {
      neededPositions.push("ATT", "ATT", "ATT", "ATT", "ATT", "ATT");
    }

    const standardPositions: ("GK" | "DEF" | "MID" | "ATT")[] = [
      "GK",
      "DEF",
      "MID",
      "ATT",
    ];
    while (neededPositions.length < totalMarketSize) {
      neededPositions.push(
        standardPositions[randRange(0, standardPositions.length - 1)],
      );
    }

    const finalPositions = neededPositions.slice(0, totalMarketSize);

    finalPositions.forEach((pos, idx) => {
      const fName = FIRST_NAMES[randRange(0, FIRST_NAMES.length - 1)];
      const lName = LAST_NAMES[randRange(0, LAST_NAMES.length - 1)];
      const rating = randRange(70, 92);

      const valFactor = Math.pow(rating - 55, 3.1) * 12500;
      const calculatedValue =
        Math.round(valFactor / 50000) * 50000 + randRange(0, 4) * 15000;

      list.push({
        id: `transfer-player-${idx}-${Date.now()}-${randRange(100, 999)}`,
        name: `${fName} ${lName}`,
        position: pos,
        rating,
        age: randRange(19, 34),
        stamina: 100,
        morale: 100,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        matchRatings: [],
        marketValue:
          calculatedValue > 100000
            ? calculatedValue
            : randRange(150, 290) * 1000,
        attributes: generatePlayerAttributes(pos, rating),
        isStarting: false,
      });
    });
    return list;
  }

  const handleRefreshScouting = () => {
    setScoutedTransferList(generateInitialTransferMarket());
    showMessage("Scouted fresh elite players on the free transfer list!");
  };

  const showMessage = (msg: string) => {
    setInfoMessage(msg);
    setTimeout(() => setInfoMessage(""), 3500);
  };

  // Upgrades
  const getUpgradeCost = (level: number) => {
    return Math.round(Math.pow(level, 1.95) * 5500 + 4000);
  };

  const trainingCost = getUpgradeCost(userClub.trainingFacilities);
  const tacticsCost = getUpgradeCost(userClub.tacticsFacilities);
  const cardioCost = getUpgradeCost(userClub.cardioFacilities);
  const medicalCost = getUpgradeCost(userClub.medicalFacilities || 1);

  const handleInteractiveSwap = (starterId: string, benchId: string) => {
    if (onAdjustSquadLineup) {
      const updatedSquad = userClub.squad.map((p) => {
        if (p.id === starterId) {
          return { ...p, isStarting: false };
        }
        if (p.id === benchId) {
          return { ...p, isStarting: true };
        }
        return p;
      });

      const finalStartingCount = updatedSquad.filter(
        (p) => p.isStarting,
      ).length;
      const finalGKCount = updatedSquad.filter(
        (p) => p.isStarting && p.position === "GK",
      ).length;

      if (finalStartingCount === 11 && finalGKCount === 1) {
        onAdjustSquadLineup(updatedSquad);
        showMessage(
          "Squad formations swapped successfully! Team sheet updated.",
        );
      } else {
        onAdjustSquadLineup(updatedSquad);
        showMessage(
          "Squad swapped. Maintain active team sheet configurations.",
        );
      }
    }
  };

  // Buy Player
  const buyPlayerFromMarket = (player: Player) => {
    if (userClub.squad.length >= 30) {
      showMessage(
        "Your active squad size is at the legal capacity limit of 30 players!",
      );
      return;
    }

    const discountMultiplier = 1 - managerSkills.negotiator * 0.05; // Up to 25% discount
    const discountedPrice = Math.round(player.marketValue * discountMultiplier);

    if (userBalance < discountedPrice) {
      showMessage(
        "Insufficient virtual club credit funds to authorize buyout transfer!",
      );
      return;
    }

    onBuyPlayer(player, discountedPrice);
    setScoutedTransferList(
      scoutedTransferList.filter((p) => p.id !== player.id),
    );
    showMessage(
      `Acquired ${player.name} (${player.position}) into your roster!`,
    );
  };

  const signYouthToAcademyClient = (player: Player) => {
    const currentYouthSquadSize = (userClub.youthSquad || []).length;
    if (currentYouthSquadSize >= 16) {
      showMessage(
        "Your youth academy squad has reached its limit of 16 players! Promote some players to the senior squad or release some to free up slots."
      );
      return;
    }

    if (userBalance < player.marketValue) {
      showMessage("Insufficient funds to recruit this youth prospect into your academy!");
      return;
    }

    onSignYouthToAcademy?.(player, player.marketValue);
    setScoutedYouthList(scoutedYouthList.filter((p) => p.id !== player.id));
    showMessage(`Successfully signed ${player.name} to your Youth Academy!`);
  };

  const buyCoachClient = (coach: Coach) => {
    if ((userClub.coaches?.length || 0) >= 8) {
      showMessage("Maximum of 8 backroom staff limits reached!");
      return;
    }

    const discountMultiplier = 1 - managerSkills.negotiator * 0.05;
    const discountedPrice = Math.round(coach.cost * discountMultiplier);

    if (userBalance < discountedPrice) {
      showMessage(
        "Insufficient virtual club credit funds to authorize staff hire!",
      );
      return;
    }

    onBuyCoach?.(coach, discountedPrice);
    setScoutedCoachList(scoutedCoachList.filter((c) => c.id !== coach.id));
    showMessage(`Hired ${coach.name} as backroom staff!`);
  };

  // Sell Player
  const sellPlayerFromSquad = (player: Player) => {
    if (userClub.squad.length <= 13) {
      showMessage(
        "League regulations require at least 13 players in your squad roster!",
      );
      return;
    }

    // Starters must be converted to bench before sellout
    if (player.isStarting) {
      showMessage("Convert player to substitute bench player before selling!");
      return;
    }

    onSellPlayer(player.id, player.marketValue);
    showMessage(
      `Sold ${player.name} for $${player.marketValue.toLocaleString()} transfer profit.`,
    );
  };

  const getApprovalProbability = (amt: number, count: number) => {
    // First 3 requests have "no consequences" (higher baseline approval)
    if (count < 3) {
      if (amt <= 100000000) return 98; // 98% approval up to 100M
      if (amt <= 250000000) return 85; // 85% approval up to 250M
      if (amt <= 500000000) return 70; // 70% approval up to 500M
      return 50; // 50% approval above 500M
    } else {
      // After 3 requests, chance of approval is affected but "not too much at all"
      if (amt <= 100000000) return 75; // Still very high! (75% for up to 100M)
      if (amt <= 250000000) return 60;
      if (amt <= 500000000) return 45;
      return 30;
    }
  };

  const handleAskForBoardFunds = () => {
    const chance = getApprovalProbability(requestedAmount, boardBackingCount);
    const roll = randRange(1, 100);

    setBoardBackingCount((prev) => prev + 1);

    if (roll <= chance) {
      if (onAddFunds) {
        onAddFunds(requestedAmount);
      }
      setBoardBackingResult(
        `PROPOSAL APPROVED: The board has voted to authorize your capital application for $${requestedAmount.toLocaleString()}! The sum has been added to your balance. (Approval Chance was ${chance}%, rolled ${roll})`,
      );
      showMessage(
        `Capital injection of $${requestedAmount.toLocaleString()} added!`,
      );
    } else {
      setBoardBackingResult(
        `PROPOSAL DECLINED: The board has formally rejected your request for $${requestedAmount.toLocaleString()}. The directors stated that the quantity is too large for the current risk profile. Try asking for a lower sum or performing better in matches. (Approval Chance was ${chance}%, rolled ${roll})`,
      );
    }
  };

  // Filter transfers list
  const filteredTransfers = scoutedTransferList.filter((item) => {
    const matchesQuery = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPos = posFilter === "ALL" || item.position === posFilter;

    let matchesRating = true;
    if (ratingRange === "BRONZE") matchesRating = item.rating < 74;
    else if (ratingRange === "SILVER")
      matchesRating = item.rating >= 74 && item.rating <= 82;
    else if (ratingRange === "GOLD") matchesRating = item.rating >= 83;

    return matchesQuery && matchesPos && matchesRating;
  });

  return (
    <div className="space-y-6 select-none animate-fadeIn text-left">
      {/* Tab Selectors */}
      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("SQUAD")}
          className={`flex-1 py-2 text-xs uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "SQUAD"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          My Squad Team Sheet
        </button>
        <button
          onClick={() => setActiveSubTab("TRANSFERS")}
          className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "TRANSFERS"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Transfers
        </button>
        <button
          onClick={() => setActiveSubTab("YOUTH")}
          className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "YOUTH"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Youth Academy
        </button>
        <button
          onClick={() => setActiveSubTab("DEVELOPMENT")}
          className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "DEVELOPMENT"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Progression
        </button>
        <button
          onClick={() => setActiveSubTab("FACILITIES")}
          className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "FACILITIES"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Facilities
        </button>
        <button
          onClick={() => setActiveSubTab("COACHES")}
          className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "COACHES"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Staff & Coaches
        </button>
        <button
          onClick={() => setActiveSubTab("BOARDROOM")}
          className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "BOARDROOM"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Boardroom
        </button>
        <button
          onClick={() => setActiveSubTab("PROFILE")}
          className={`flex-1 py-2 text-xs uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === "PROFILE"
              ? "bg-sky-500 text-black shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Manager Profile
        </button>
      </div>

      {infoMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2.5 font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* SQUAD SHEET VIEW */}
      {activeSubTab === "SQUAD" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121620] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Roster Size
                </span>
                <h4 className="text-2xl font-mono font-black text-white mt-1">
                  {userClub.squad.length} / 20 Registered
                </h4>
              </div>
              <UserCheck className="w-8 h-8 text-sky-400 opacity-60" />
            </div>

            <div className="bg-[#121620] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Current OVR Rating
                </span>
                <h4 className="text-2xl font-mono font-black text-emerald-400 mt-1">
                  {Math.round(
                    userClub.squad.reduce((s, p) => s + p.rating, 0) /
                      userClub.squad.length,
                  )}{" "}
                  OVR
                </h4>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>

            <div className="bg-[#121620] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Tactical Manager
                </span>
                <h4 className="text-md font-mono font-black text-amber-500 mt-1">
                  {userClub.coach.name}
                </h4>
                <span className="text-[9px] text-slate-400">
                  Class A Head Coach ({userClub.coach.specialty})
                </span>
              </div>
              <Award className="w-8 h-8 text-amber-500 opacity-60" />
            </div>
          </div>

          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3 md:mb-0">
                📋 ACTIVE REGISTERED TEAM SHEET (11 Starters + Substitutes
                Bench)
              </h3>

              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                    Formation:
                  </span>
                  <select
                    value={userClub.formation || "4-3-3"}
                    onChange={(e) =>
                      onChangeUserFormation?.(e.target.value as any)
                    }
                    className="bg-slate-900 border border-white/10 text-xs font-bold text-sky-400 py-1.5 px-3 rounded-lg outline-none custom-scrollbar"
                  >
                    <option value="4-3-3">4-3-3</option>
                    <option value="4-4-2">4-4-2</option>
                    <option value="3-5-2">3-5-2</option>
                    <option value="4-2-3-1">4-2-3-1</option>
                    <option value="5-3-2">5-3-2</option>
                    <option value="3-4-3">3-4-3</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                    Tactical Mentality:
                  </span>
                  <select
                    value={userClub.mentality}
                    onChange={(e) =>
                      onChangeUserMentality?.(e.target.value as any)
                    }
                    className="bg-slate-900 border border-white/10 text-xs font-bold text-amber-500 py-1.5 px-3 rounded-lg outline-none custom-scrollbar"
                  >
                    <option value="Balanced">Balanced</option>
                    <option value="Attacking">Attacking</option>
                    <option value="Defensive">Defensive</option>
                    <option value="Gegenpressing">Gegenpressing</option>
                    <option value="Park the Bus">Park the Bus</option>
                    <option value="Tiki-Taka">Tiki-Taka</option>
                    <option value="Counter-Attack">Counter-Attack</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                    Playstyle Focus:
                  </span>
                  <select
                    value={userClub.playstyle || "Balanced"}
                    onChange={(e) =>
                      onChangeUserPlaystyle?.(e.target.value as PlaystyleType)
                    }
                    className="bg-slate-900 border border-white/10 text-xs font-bold text-emerald-400 py-1.5 px-3 rounded-lg outline-none custom-scrollbar"
                  >
                    <option value="Balanced">Balanced Plays</option>
                    <option value="Attacking">Attacking Plays</option>
                    <option value="Defending">Defending Plays</option>
                  </select>
                </div>
              </div>
            </div>

            <SquadPitch
              squad={userClub.squad}
              mentality={userClub.mentality}
              formation={userClub.formation || "4-3-3"}
              clubColor={userClub.color}
              onSwapPlayers={handleInteractiveSwap}
              onTapPlayer={onTapPlayer}
            />

            <div className="mt-8 border-t border-white/5 pt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                Detailed Roster Statistics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase text-slate-500 font-mono">
                      <th className="py-2">Squad Player Card</th>
                      <th className="py-2 text-center">POS</th>
                      <th className="py-2 text-center">OVR</th>
                      <th className="py-2 text-center">STAMINA</th>
                      <th className="py-2 text-center">GOALS / ASSISTS</th>
                      <th className="py-2 text-center">QUALITIES INDEX</th>
                      <th className="py-2 text-right">MARKET VALUE</th>
                      <th className="py-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userClub.squad.map((player) => {
                      const isStarter = player.isStarting;

                      return (
                        <tr
                          key={player.id}
                          className="text-xs hover:bg-white/5 transition-all"
                        >
                          <td className="py-3">
                            <div className="flex flex-col">
                              <span
                                onClick={() => onTapPlayer?.(player.id)}
                                className="font-bold text-white text-sm cursor-pointer hover:underline hover:text-sky-400"
                              >
                                {player.name}
                              </span>
                              <span className="text-[9px] text-slate-400 flex items-center gap-1.5 font-mono">
                                {isStarter ? (
                                  <span className="bg-[#22c55e]/15 text-[#22c55e] inline-block px-1 rounded-sm text-[8px] font-black uppercase">
                                    Active Starter
                                  </span>
                                ) : (
                                  <span className="bg-slate-800/80 text-slate-500 inline-block px-1 rounded-sm text-[8px] font-black uppercase">
                                    Sub bench
                                  </span>
                                )}
                                ID: #
                                {player.id.substring(
                                  player.id.lastIndexOf("-") + 1,
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[9px] ${
                                player.position === "GK"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : player.position === "DEF"
                                    ? "bg-sky-500/20 text-sky-400"
                                    : player.position === "MID"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-rose-500/20 text-rose-450"
                              }`}
                            >
                              {player.position}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                              {player.rating}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`font-mono font-bold ${player.stamina < 60 ? "text-rose-400" : "text-emerald-400"}`}
                              >
                                {Math.round(player.stamina)}%
                              </span>
                              <div className="w-14 bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{
                                    width: `${player.stamina}%`,
                                    backgroundColor:
                                      player.stamina < 60
                                        ? "#f43f5e"
                                        : "#10b981",
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center font-mono text-slate-400 font-bold">
                            {player.goals} Goals / {player.assists} Asts
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex gap-2 text-[8px] text-slate-500 font-mono justify-center">
                              <span>
                                PAC:{" "}
                                <strong className="text-slate-300">
                                  {player.attributes?.pace || player.rating}
                                </strong>
                              </span>
                              <span>
                                SHO:{" "}
                                <strong className="text-slate-300">
                                  {player.attributes?.shooting || player.rating}
                                </strong>
                              </span>
                              <span>
                                PAS:{" "}
                                <strong className="text-slate-300">
                                  {player.attributes?.passing || player.rating}
                                </strong>
                              </span>
                              <span>
                                DEF:{" "}
                                <strong className="text-slate-300">
                                  {player.attributes?.defending ||
                                    player.rating}
                                </strong>
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-white text-sm">
                            ${player.marketValue.toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => sellPlayerFromSquad(player)}
                                disabled={player.isStarting}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 disabled:opacity-30 disabled:pointer-events-none text-rose-455 hover:text-black font-extrabold uppercase text-[9px] rounded-lg transition-all cursor-pointer"
                              >
                                SELL
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MARKET VIEW */}
      {activeSubTab === "TRANSFERS" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-sky-400" />
                  Global Recruitment & Agency Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access live databases for senior stars, rising youth superstars, or technical backroom staff.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleRefreshScouting}
                  className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Agency Targets
                </button>
                <div className="bg-slate-950/80 border border-white/5 px-4 py-2 rounded-lg text-right">
                  <span className="text-[9px] uppercase text-slate-500 font-mono block">YOUR CLUB BALANCE</span>
                  <strong className="text-amber-500 font-black font-mono text-sm">${userBalance.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Segment Controls */}
            <div className="flex flex-wrap gap-2.5 bg-black/30 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setTransferSegment("PLAYERS")}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  transferSegment === "PLAYERS"
                    ? "bg-sky-500 text-black shadow-md font-black"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>🥇 Senior Players</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-black/15 rounded">
                  {filteredTransfers.length}
                </span>
              </button>
              <button
                onClick={() => setTransferSegment("YOUTH")}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  transferSegment === "YOUTH"
                    ? "bg-emerald-500 text-black shadow-md font-black"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>🔥 Youth Academy Perks</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-black/15 rounded">
                  {scoutedYouthList.length}
                </span>
              </button>
              <button
                onClick={() => setTransferSegment("COACHES")}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  transferSegment === "COACHES"
                    ? "bg-purple-500 text-white shadow-md font-black"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>💼 Backroom Staff</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded">
                  {scoutedCoachList.length}
                </span>
              </button>
            </div>

            {/* Conditionally Render Filters ONLY for senior player search */}
            {transferSegment === "PLAYERS" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-semibold pt-2">
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search player name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c2230] border border-white/10 text-white rounded-lg p-2.5 pl-10 outline-none focus:border-sky-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <select
                    value={posFilter}
                    onChange={(e) => setPosFilter(e.target.value)}
                    className="w-full bg-[#1c2230] border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-sky-500 transition-all cursor-pointer"
                  >
                    <option value="ALL">All Field Positions</option>
                    <option value="GK">GK (Goalkeepers)</option>
                    <option value="DEF">Defender Roles</option>
                    <option value="MID">Midfield Maestro</option>
                    <option value="ATT">Attacking Strikers</option>
                  </select>
                </div>

                <div>
                  <select
                    value={ratingRange}
                    onChange={(e) => setRatingRange(e.target.value)}
                    className="w-full bg-[#1c2230] border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-sky-500 transition-all cursor-pointer"
                  >
                    <option value="ALL">All Rating Intervals</option>
                    <option value="BRONZE">Bronze Recruits (&lt; 74 OVR)</option>
                    <option value="SILVER">Silver Contenders (74 - 82 OVR)</option>
                    <option value="GOLD">Elite Champions (83+ OVR)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE GRID SEGMENT */}
          {transferSegment === "PLAYERS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTransfers.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-[#121620] border border-dashed border-white/10 rounded-2xl text-slate-500 font-mono text-xs italic">
                  No senior players match your filter attributes.
                </div>
              ) : (
                filteredTransfers.map((item) => {
                  const hasDiscount = managerSkills.negotiator > 0;
                  const discountedPrice = Math.round(
                    item.marketValue * (1 - managerSkills.negotiator * 0.05)
                  );
                  const isSpecialYouth = item.age && item.age < 21;

                  return (
                    <div
                      key={item.id}
                      className="bg-gradient-to-b from-[#121620] to-[#0c0f16] border border-white/10 rounded-2xl p-4.5 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all duration-300 relative group shadow-lg"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                                item.position === "GK"
                                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                  : item.position === "DEF"
                                    ? "bg-sky-500/10 text-sky-400 border border-sky-400/20"
                                    : item.position === "MID"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"
                                      : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                              }`}
                            >
                              {item.position}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              Age: <span className="text-white">{item.age} y/o</span>
                            </span>
                          </div>
                          <strong className="text-xl font-black font-mono text-white tracking-tighter bg-white/5 shrink-0 px-2.5 py-0.5 rounded-lg border border-white/10">
                            {item.rating}
                          </strong>
                        </div>

                        {/* Special Tags for recruitment */}
                        <div className="mb-2">
                          {isSpecialYouth ? (
                            <span className="text-[8px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                              ⭐ ELITE YOUTH PROSPECT
                            </span>
                          ) : (
                            <span className="text-[8px] bg-slate-850 text-slate-400 border border-white/5 px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                              🥇 CLUB SENIOR TARGET
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => onTapPlayer?.(item.id)}
                          className="text-sm font-black text-white hover:underline cursor-pointer tracking-tight truncate hover:text-sky-400"
                        >
                          {item.name}
                        </h4>

                        {/* Attribute Showcase bars */}
                        <div className="space-y-1.5 my-4 pt-2.5 border-t border-white/5 text-[9px] font-mono text-slate-400">
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>PACE AND DRIFT:</span>
                              <strong className="text-slate-200">{item.attributes?.pace || item.rating}</strong>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500"
                                style={{ width: `${item.attributes?.pace || item.rating}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>STRIKING ACCURACY:</span>
                              <strong className="text-slate-200">{item.attributes?.shooting || item.rating}</strong>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500"
                                style={{ width: `${item.attributes?.shooting || item.rating}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>MIDFIELD PASSING:</span>
                              <strong className="text-slate-200">{item.attributes?.passing || item.rating}</strong>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${item.attributes?.passing || item.rating}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between text-xs font-mono font-bold items-center">
                          <span className="text-slate-500 text-[10px] uppercase font-sans">Negotiated Cost</span>
                          <div className="text-right">
                            {hasDiscount && (
                              <span className="line-through text-slate-600 text-[10px] mr-1.5 opacity-60 block">
                                ${item.marketValue.toLocaleString()}
                              </span>
                            )}
                            <span className="text-amber-500 font-extrabold text-sm block">
                              ${discountedPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => buyPlayerFromMarket(item)}
                          disabled={userBalance < discountedPrice}
                          className="w-full mt-1.5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:opacity-40 disabled:text-slate-600 text-black uppercase font-black text-[10px] tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                        >
                          AUTHORIZED TRANSFER
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {transferSegment === "YOUTH" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scoutedYouthList.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-[#121620] border border-dashed border-white/10 rounded-2xl text-slate-500 font-mono text-xs italic">
                  No scouted youth academy potentials found this cycle. Tap refresh targets above!
                </div>
              ) : (
                scoutedYouthList.map((y) => {
                  const potOffset = (y.potentialRating || 90) - y.rating;
                  const currentPace = y.attributes?.pace || y.rating;
                  const currentShooting = y.attributes?.shooting || y.rating;
                  const currentPassing = y.attributes?.passing || y.rating;

                  return (
                    <div
                      key={y.id}
                      className="bg-[#121620]/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.08)] transition-all duration-300 relative shadow-lg"
                    >
                      <div>
                        {/* Tag & rating row */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                              🔥 YOUTH PROSPECT
                            </span>
                            <span className="text-xs text-sky-400 font-bold mt-1 uppercase">
                              {y.position} • Age {y.age}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-amber-500 font-bold bg-amber-950/40 border border-amber-500/10 px-2.5 py-0.5 rounded">
                              OVR {y.rating} ➔ {y.potentialRating} POT
                            </div>
                          </div>
                        </div>

                        <h4
                          onClick={() => onTapPlayer?.(y.id)}
                          className="text-base font-black text-white hover:underline cursor-pointer tracking-tight mb-3"
                        >
                          {y.name}
                        </h4>

                        {/* Skill Dual Stat Progression */}
                        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-white/5 space-y-3 mb-4">
                          <DualStatProgress label="Pace (PAC)" current={currentPace} potential={Math.min(99, currentPace + potOffset)} />
                          <DualStatProgress label="Shooting (SHO)" current={currentShooting} potential={Math.min(99, currentShooting + potOffset)} />
                          <DualStatProgress label="Passing (PAS)" current={currentPassing} potential={Math.min(99, currentPassing + potOffset)} />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between text-xs font-mono font-bold items-center">
                          <span className="text-slate-500">Recruitment Cost</span>
                          <span className="text-amber-500 text-sm">
                            ${y.marketValue.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => signYouthToAcademyClient(y)}
                          disabled={userBalance < y.marketValue}
                          className="w-full mt-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] tracking-widest py-2.5 uppercase rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-40 transition-all cursor-pointer shadow-md"
                        >
                          SIGN TO YOUTH ACADEMY
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {transferSegment === "COACHES" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scoutedCoachList.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-[#121620] border border-dashed border-white/10 rounded-2xl text-slate-500 font-mono text-xs italic">
                  No coaches currently seeking employment. Tap Refresh Targets above!
                </div>
              ) : (
                scoutedCoachList.map((c) => {
                  const discountMultiplier = 1 - managerSkills.negotiator * 0.05;
                  const discountedPrice = Math.round(c.cost * discountMultiplier);

                  return (
                    <div
                      key={c.id}
                      className="bg-[#121620]/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.08)] transition-all duration-300 relative shadow-lg"
                    >
                      <div>
                        {/* Coach specialization header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                              💼 COACH SPECIALIST
                            </span>
                            <span className="text-[11px] text-sky-400 font-bold mt-1 uppercase">
                              {c.specialty} Specialty
                            </span>
                          </div>
                          <div className="text-center font-mono bg-purple-950/40 border border-purple-500/15 px-2.5 py-1 rounded">
                            <div className="text-[8px] text-slate-400 font-sans uppercase">Coach OVR</div>
                            <div className="text-sm font-black text-white">{c.rating}</div>
                          </div>
                        </div>

                        <h4 className="text-base font-black text-white mb-2">{c.name}</h4>

                        {/* Coach technical specification metrics */}
                        <div className="space-y-1.5 my-3.5 bg-black/3c rounded-xl p-3 border border-white/5 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Biological Age:</span>
                            <span className="text-white font-bold">{c.age || 45} Years Old</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tactical Strategy:</span>
                            <span className="text-emerald-450 font-bold uppercase tracking-wider">
                              {c.preferredMentality || "Balanced"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Familiarity Class:</span>
                            <span className="text-purple-400 font-semibold">{c.specialty} Level A</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between text-xs font-mono font-bold items-center">
                          <span className="text-slate-500">Agency Appointment Cost</span>
                          <div className="text-right">
                            {managerSkills.negotiator > 0 && (
                              <span className="line-through text-slate-600 text-[10px] mr-1 block">
                                ${c.cost.toLocaleString()}
                              </span>
                            )}
                            <span className="text-amber-500 font-extrabold text-sm block">
                              ${discountedPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => buyCoachClient(c)}
                          disabled={userBalance < discountedPrice}
                          className="w-full mt-1 bg-purple-500 hover:bg-purple-400 text-white font-black text-[10px] tracking-widest py-2.5 uppercase rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-40 transition-all cursor-pointer shadow-md"
                        >
                          HIRE SPECIALIST STAFF
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* DEVELOPMENT VIEW */}
      {activeSubTab === "DEVELOPMENT" && (
        <div className="animate-fadeIn space-y-4">
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="border-b border-white/5 pb-3 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Player Development & Coaching Focus Center
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct your backroom specialist staff to focus on specific player progression.
                    You can assign dedicated coaches to a <span className="text-sky-400 font-bold">maximum of 6 players</span>.
                  </p>
                </div>
                <div className="bg-slate-950/80 border border-white/5 rounded-lg px-3 py-1.5 text-right shrink-0">
                  <div className="text-[9px] uppercase text-slate-500 font-mono">Specialist Focus Slots</div>
                  <div className="text-xs font-mono font-bold text-sky-400">
                    {userClub.squad.filter((p) => p.focusedCoachId).length} / 6 Assigned
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {userClub.squad.map((p) => {
                const ageFactor =
                  p.age < 23
                    ? "text-emerald-400"
                    : p.age > 30
                      ? "text-rose-400"
                      : "text-slate-300";

                const uniqueCoaches = new Set();
                const allCoachesAvailable = [userClub.coach, ...(userClub.coaches || [])].filter((c) => {
                  if (!c || !c.id) return false;
                  if (uniqueCoaches.has(c.id)) return false;
                  uniqueCoaches.add(c.id);
                  return true;
                });
                const assignedCoach = allCoachesAvailable.find((c) => c.id === p.focusedCoachId);
                const focusedCount = userClub.squad.filter((pl) => pl.focusedCoachId).length;
                const canAssignMore = focusedCount < 6;

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col border ${p.focusedCoachId ? "border-sky-500/35 bg-sky-950/20" : "border-white/5 bg-slate-900/40"} p-5 rounded-xl gap-4 transition-all`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Name Card */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded font-bold">
                            {p.position}
                          </span>
                          {p.focusedCoachId && (
                            <span className="text-[9px] bg-sky-500 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                              ⚡ Coach Assigned
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-mono">
                          Age <span className={ageFactor}>{p.age}</span> • Rating: <span className="text-amber-400 font-bold">{p.rating} OVR</span> • Potential: <span className="text-sky-400 font-bold">{p.potentialRating || 88} POT</span>
                        </div>
                      </div>

                      {/* Specialist Coach Selector Slot */}
                      <div className="flex flex-col items-start md:items-end gap-1 shrink-0 w-full md:w-auto">
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Direct Dedicated Coach</label>
                        <select
                          value={p.focusedCoachId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const alreadyAssignedTo = userClub.squad.find(
                                (op) => op.id !== p.id && op.focusedCoachId === val
                              );
                              if (alreadyAssignedTo) {
                                const confirmMove = window.confirm(
                                  `This coach is already assigned to ${alreadyAssignedTo.name}. Do you want to reassign them to ${p.name}?`
                                );
                                if (!confirmMove) {
                                  // Revert to current value since it's controlled
                                  e.target.value = p.focusedCoachId || "";
                                  return;
                                }
                              }
                            }
                            onAssignCoachToPlayer?.(p.id, val || null);
                          }}
                          className="w-full md:w-64 bg-slate-950 border border-white/10 text-xs font-bold text-slate-300 py-2 px-3 rounded-lg outline-none cursor-pointer focus:border-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="">-- No Coach (Off duty) --</option>
                          {allCoachesAvailable.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.specialty} • OVR {c.rating})
                            </option>
                          ))}
                        </select>
                        {!p.focusedCoachId && !canAssignMore && (
                          <span className="text-[8px] text-rose-400 uppercase tracking-widest font-mono mt-1">
                            ⚠️ Coach Focus limit reached (Max 6)
                          </span>
                        )}
                        {assignedCoach && (
                          <span className="text-[9px] text-emerald-450 font-mono uppercase bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded mt-1 flex items-center gap-1">
                            🌱 {assignedCoach.specialty} Specialty Coaching enabled! (+{(assignedCoach.rating / 10).toFixed(1)}x training velocity)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Progress Dual Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-4 border-t border-white/5">
                      <div className="space-y-3">
                        <DualStatProgress
                          label="Overall Training Progression"
                          current={p.rating}
                          potential={p.potentialRating || Math.min(99, p.rating + 10)}
                        />
                        
                        {/* Interactive training bar progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                            <span>Season Gym Rep Experience (XP)</span>
                            <span className="text-emerald-400 font-bold">{p.trainingProgress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5 relative">
                            <div
                              className={`h-full ${p.focusedCoachId ? "bg-gradient-to-r from-sky-500 to-cyan-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"} transition-all duration-700`}
                              style={{ width: `${p.trainingProgress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Attribute Stats Showcase */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950/30 p-3 rounded-lg border border-white/5">
                        <div className="text-center bg-[#090b0f] p-1.5 rounded border border-white/5">
                          <span className="text-[9px] uppercase text-slate-500 block">Pace</span>
                          <span className="text-xs font-mono font-black text-slate-200">{p.attributes?.pace || p.rating}</span>
                        </div>
                        <div className="text-center bg-[#090b0f] p-1.5 rounded border border-white/5">
                          <span className="text-[9px] uppercase text-slate-500 block">Shoot</span>
                          <span className="text-xs font-mono font-black text-slate-200">{p.attributes?.shooting || p.rating}</span>
                        </div>
                        <div className="text-center bg-[#090b0f] p-1.5 rounded border border-white/5">
                          <span className="text-[9px] uppercase text-slate-500 block">Pass</span>
                          <span className="text-xs font-mono font-black text-slate-200">{p.attributes?.passing || p.rating}</span>
                        </div>
                        <div className="text-center bg-[#090b0f] p-1.5 rounded border border-white/5">
                          <span className="text-[9px] uppercase text-slate-500 block">Dribble</span>
                          <span className="text-xs font-mono font-black text-slate-200">{p.attributes?.dribbling || p.rating}</span>
                        </div>
                        <div className="text-center bg-[#090b0f] p-1.5 rounded border border-white/5">
                          <span className="text-[9px] uppercase text-slate-500 block font-sans">Defend</span>
                          <span className="text-xs font-mono font-black text-slate-200">{p.attributes?.defending || Math.round(p.rating * 0.8)}</span>
                        </div>
                        <div className="text-center bg-[#090b0f] p-1.5 rounded border border-white/5">
                          <span className="text-[9px] uppercase text-slate-500 block">Physical</span>
                          <span className="text-xs font-mono font-black text-slate-200">{p.attributes?.physical || p.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* YOUTH ACADEMY VIEW */}
      {activeSubTab === "YOUTH" && (
        <div className="animate-fadeIn space-y-4">
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="border-b border-white/5 pb-3 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    My Club Youth Academy Squad
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Develop your prospective stars here. When they are ready, click <span className="text-emerald-400 font-bold">Include in Squad</span> to promote them into your first team list.
                  </p>
                </div>
                <div className="bg-slate-950/85 border border-white/5 px-4 py-2 rounded-lg text-right shrink-0">
                  <div className="text-[9px] uppercase text-slate-500 font-mono">Academy Capacity limit</div>
                  <div className="text-xs font-mono font-bold text-emerald-450">
                    {(userClub.youthSquad || []).length} / 16 Players
                  </div>
                </div>
              </div>
            </div>

            {!(userClub.youthSquad) || userClub.youthSquad.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-xl bg-slate-900/40 space-y-3">
                <div className="text-slate-500 font-mono text-xs uppercase tracking-wider">
                  ⚠️ Your Youth Academy roster is currently vacant
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Head over to the <span className="text-sky-400 font-bold">Transfer & Scouting</span> tab at the side, and toggle the <span className="font-bold">Youth Academy Scouting</span> panel to recruit top wonderkids globally!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {(userClub.youthSquad || []).map((y) => {
                  const potOffset = (y.potentialRating || 90) - y.rating;
                  const currentPace = y.attributes?.pace || y.rating;
                  const currentShooting = y.attributes?.shooting || y.rating;
                  const currentPassing = y.attributes?.passing || y.rating;
                  const currentDribbling = y.attributes?.dribbling || y.rating;
                  const currentDefending = y.attributes?.defending || Math.round(y.rating * 0.85);
                  const currentPhysical = y.attributes?.physical || y.rating;

                  return (
                    <div
                      key={y.id}
                      className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col gap-4 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start border-b border-white/5 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-base font-sans tracking-tight">
                              {y.name}
                            </span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-450 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
                              {y.position}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Age: <span className="text-white font-mono font-bold">{y.age} y/o</span> • Nationality: <span className="text-slate-350">{y.nationality || "Prospect"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Academy Status</span>
                          <span className="text-xs font-bold text-amber-500 font-mono bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded inline-block mt-0.5">
                            OVR {y.rating} ➔ POT {y.potentialRating || 88}
                          </span>
                        </div>
                      </div>

                      {/* Attribute Dual Bar visualizer */}
                      <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                        <h4 className="text-[9px] uppercase text-slate-500 font-bold tracking-wider font-mono">Attributes & Growth potential projection</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                          <DualStatProgress label="Pace (PAC)" current={currentPace} potential={Math.min(99, currentPace + potOffset)} />
                          <DualStatProgress label="Shooting (SHO)" current={currentShooting} potential={Math.min(99, currentShooting + potOffset)} />
                          <DualStatProgress label="Passing (PAS)" current={currentPassing} potential={Math.min(99, currentPassing + potOffset)} />
                          <DualStatProgress label="Dribbling (DRI)" current={currentDribbling} potential={Math.min(99, currentDribbling + potOffset)} />
                          <DualStatProgress label="Defending (DEF)" current={currentDefending} potential={Math.min(99, currentDefending + potOffset)} />
                          <DualStatProgress label="Physicality (PHY)" current={currentPhysical} potential={Math.min(99, currentPhysical + potOffset)} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                        <div className="font-mono text-left">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">Transfer value</span>
                          <span className="text-xs text-white font-black">${(y.marketValue || (y.rating * 125000)).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (userClub.squad.length >= 30) {
                              showMessage("Your active senior squad is at capacity (Max 30 players). Re-organize or sell a player first!");
                              return;
                            }
                            const seniorYouthCount = userClub.squad.filter(p => p.age < 21 || p.isYouth).length;
                            if (seniorYouthCount >= 10) {
                              showMessage("Strict regulation limit reached! A maximum of 10 youth players are allowed in your active senior squad roster.");
                              return;
                            }
                            onPromoteYouth?.(y.id);
                            showMessage(`Congratulations! ${y.name} promoted successfully to the active first team squad!`);
                          }}
                          className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          Include in Senior Squad
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COACHES VIEW */}
      {activeSubTab === "COACHES" && (
        <div className="animate-fadeIn space-y-4">
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="border-b border-white/5 pb-3 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Backroom Staff & Coaches
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Hire specialized coaches from the open market. You can install
                up to 8 backroom staff to gain tactical edges and boost
                progression rates.
              </p>
            </div>

            {userClub.coaches && userClub.coaches.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                  Active Backroom Staff ({userClub.coaches.length}/8)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {userClub.coaches.map((c, idx) => (
                    <div
                      key={`${c.id}-${idx}`}
                      className="bg-sky-950/20 border border-sky-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center"
                    >
                      <div className="font-bold text-white text-sm mb-1">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-sky-400 uppercase tracking-widest">
                        {c.specialty} Coach
                      </div>
                      <div className="text-xs font-mono text-amber-500 font-bold mt-1">
                        RATING {c.rating}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Available Coach Market
              </h4>
              {scoutedCoachList.map((c) => {
                const discountMultiplier = 1 - managerSkills.negotiator * 0.05;
                const discountedPrice = Math.round(c.cost * discountMultiplier);

                return (
                  <div
                    key={c.id}
                    className="flex flex-col md:flex-row items-center border border-white/5 bg-slate-900/40 p-4 rounded-xl gap-4 justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-sky-400 uppercase tracking-widest">
                        {c.specialty} Specialist • Prefers{" "}
                        {c.preferredMentality}
                      </span>
                    </div>
                    <div className="text-center shrink-0 w-24 border-l border-white/5">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">
                        Coach OVR
                      </div>
                      <div className="text-xl font-black text-amber-500 font-mono">
                        {c.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        {managerSkills.negotiator > 0 && (
                          <span className="line-through text-slate-600 block text-[9px] mb-0.5">
                            ${c.cost.toLocaleString()}
                          </span>
                        )}
                        <span className="text-emerald-400 font-mono font-bold text-xs">
                          ${discountedPrice.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => buyCoachClient(c)}
                        disabled={
                          userBalance < discountedPrice ||
                          (userClub.coaches?.length || 0) >= 8
                        }
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-slate-800 text-black uppercase font-black text-[9px] px-3 py-2 rounded-lg tracking-wider transition-all"
                      >
                        Hire Staff
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FACILITIES VIEW */}
      {activeSubTab === "FACILITIES" && (
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>

          <div className="border-b border-white/5 pb-3 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-500 animate-pulse" />
              Club Facility Infrastructure Upgrades
            </h3>
            <p className="text-xs text-slate-550 mt-1">
              Investing in premium facilities locks permanent boosts to training
              rate, stamina retention, tactics, or physical recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Defensive / Skill Ground */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    Training Ground
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    Lvl {userClub.trainingFacilities}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  Boosts defensive stats, and increases rating growth curves for
                  the youth squads.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${Math.min(100, userClub.trainingFacilities * 20)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities("training", trainingCost)}
                disabled={
                  userBalance < trainingCost || userClub.trainingFacilities >= 5
                }
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {userClub.trainingFacilities >= 5
                  ? "MAX LEVEL reached"
                  : `UPGRADE FOR $${trainingCost.toLocaleString()}`}
              </button>
            </div>

            {/* Tactics Room */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    Tactics Analytics Room
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    Lvl {userClub.tacticsFacilities}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  Advanced tactical workshops boost passing accuracy, Tiki-Taka
                  control, and goalie strike box results.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-sky-500"
                    style={{
                      width: `${Math.min(100, userClub.tacticsFacilities * 20)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities("tactics", tacticsCost)}
                disabled={
                  userBalance < tacticsCost || userClub.tacticsFacilities >= 5
                }
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {userClub.tacticsFacilities >= 5
                  ? "MAX LEVEL reached"
                  : `UPGRADE FOR $${tacticsCost.toLocaleString()}`}
              </button>
            </div>

            {/* Cardio physiology */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    Cardio Physiology Gym
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Lvl {userClub.cardioFacilities}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  氧 Oxygen retention conditioning. Slows down player stamina
                  match fatigue decay curves by 8% per level.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${Math.min(100, userClub.cardioFacilities * 20)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities("cardio", cardioCost)}
                disabled={
                  userBalance < cardioCost || userClub.cardioFacilities >= 5
                }
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {userClub.cardioFacilities >= 5
                  ? "MAX LEVEL reached"
                  : `UPGRADE FOR $${cardioCost.toLocaleString()}`}
              </button>
            </div>

            {/* Medical Clinic Center (Stamina Regeneration upgrade) */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                    Medical Clinic Center
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-450">
                    Lvl {userClub.medicalFacilities || 1}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  Provides high-level sports physical therapy. Accelerates squad
                  stamina weekly recovery rates after heavy matchdays.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-rose-500"
                    style={{
                      width: `${Math.min(100, (userClub.medicalFacilities || 1) * 20)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities("medical", medicalCost)}
                disabled={
                  userBalance < medicalCost ||
                  (userClub.medicalFacilities || 1) >= 5
                }
                className="w-full py-2 bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {(userClub.medicalFacilities || 1) >= 5
                  ? "MAX LEVEL reached"
                  : `UPGRADE FOR $${medicalCost.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOARDROOM VIEW */}
      {activeSubTab === "BOARDROOM" && (
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 relative overflow-hidden animate-fadeIn space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <Landmark className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Executive Club Boardroom
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Review contractual objectives, manager standing ratings, and
                  request critical emergency funding.
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Board Status Rating
              </span>
              <strong className="text-sm font-black text-emerald-400 block uppercase mt-0.5">
                secured (EXCELLENT)
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] font-mono border-b border-white/5 pb-1">
                Executive Contract Overview
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Current Position:</span>
                  <span className="text-white font-bold">
                    First Team Manager
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">
                    Contract Term Duration:
                  </span>
                  <span className="text-sky-400 font-bold">
                    3 Years Remaining
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Board Approval Rate:</span>
                  <span className="text-emerald-400 font-bold">
                    88.5% (Trustworthy)
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Primary Objective:</span>
                  <span className="text-amber-500 font-bold">
                    Maintain safe standing & qualify Cup
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1c2230]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-450" />
                  Apply for Custom Board Capital Funds
                </h4>
                <p className="text-[11px] text-slate-400 mt-2">
                  Submit a customized capital projection plan. Funding requests
                  carry dynamic director approval rates based strictly on the
                  requested volume. Over-requesting harms board trust.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-1">
                    Requested Amount ($):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="50000"
                      max="50000000"
                      step="50000"
                      value={requestedAmount}
                      onChange={(e) =>
                        setRequestedAmount(
                          Math.max(50000, Number(e.target.value)),
                        )
                      }
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-sky-500 flex-1"
                    />
                  </div>
                </div>

                {/* Predefined Quick Amounts */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[10000000, 50000000, 100000000, 250000000, 500000000].map(
                    (quickAmt) => (
                      <button
                        key={quickAmt}
                        onClick={() => setRequestedAmount(quickAmt)}
                        className={`px-2 py-1 text-[9px] uppercase font-mono font-extrabold rounded border transition-all cursor-pointer ${
                          requestedAmount === quickAmt
                            ? "bg-sky-500/20 text-sky-400 border-sky-400"
                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        $
                        {quickAmt >= 1000000
                          ? `${(quickAmt / 1000000).toFixed(0)}M`
                          : `${(quickAmt / 1000).toFixed(0)}K`}
                      </button>
                    ),
                  )}
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-xs">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-500">
                      REQUEST LIKELIHOOD FACTOR:
                    </span>
                    <span
                      className={`font-black uppercase ${
                        getApprovalProbability(
                          requestedAmount,
                          boardBackingCount,
                        ) >= 80
                          ? "text-emerald-400"
                          : getApprovalProbability(
                                requestedAmount,
                                boardBackingCount,
                              ) >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                      }`}
                    >
                      {getApprovalProbability(
                        requestedAmount,
                        boardBackingCount,
                      )}
                      % (PROBABILITY)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        getApprovalProbability(
                          requestedAmount,
                          boardBackingCount,
                        ) >= 80
                          ? "bg-emerald-505 bg-emerald-500"
                          : getApprovalProbability(
                                requestedAmount,
                                boardBackingCount,
                              ) >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                      style={{
                        width: `${getApprovalProbability(requestedAmount, boardBackingCount)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 shrink-0">
                <button
                  onClick={handleAskForBoardFunds}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Landmark className="w-4 h-4" />
                  SUBMIT APPLIED FINANCE REQUEST (Attempts: {boardBackingCount})
                </button>
              </div>
            </div>
          </div>

          {boardBackingResult && (
            <div className="p-4 bg-slate-950/60 border border-sky-500/20 rounded-xl space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-xs text-sky-400 font-black uppercase font-mono">
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
                <span>Executive Decision Dispatch</span>
              </div>
              <p className="text-[11.5px] text-slate-350">
                {boardBackingResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MANAGER PROFILE VIEW */}
      {activeSubTab === "PROFILE" && (
        <div className="animate-fadeIn space-y-4">
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-6 relative">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-8 h-8 text-sky-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {managerName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Lv.{" "}
                    {managerSkills.level} Profile
                  </span>
                  <span>
                    XP: {managerSkills.xp} / {managerSkills.level * 1000}
                  </span>
                </div>
                <div className="mt-2 w-full max-w-xs bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-700"
                    style={{
                      width: `${(managerSkills.xp / (managerSkills.level * 1000)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="shrink-0 text-center bg-slate-900 border border-white/10 p-2 px-4 rounded-xl">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-0.5">
                  Unspent Points
                </div>
                <div className="text-2xl font-black text-amber-500">
                  {managerSkills.skillPoints}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2">
                Manager Trait Trees
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Tactical Mastermind
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex-1">
                    Boosts passing metrics and overall match performance
                    directly during the simulation clock.
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Lv. {managerSkills.tacticalMastermind}
                    </span>
                    <button
                      onClick={() => onUpgradeSkill("tacticalMastermind")}
                      disabled={
                        managerSkills.skillPoints <= 0 ||
                        managerSkills.tacticalMastermind >= 5
                      }
                      className="px-3 py-1 bg-sky-500 hover:bg-sky-450 disabled:bg-slate-800 disabled:text-slate-600 text-black text-[9px] font-black tracking-widest uppercase rounded-md transition-all"
                    >
                      {managerSkills.tacticalMastermind >= 5
                        ? "MAXED"
                        : "UPGRADE"}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Master Negotiator
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex-1">
                    Reduces player transfer costs proportionally to your skill
                    level on the scout market.
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-mono font-bold text-amber-500">
                      Lv. {managerSkills.negotiator}
                    </span>
                    <button
                      onClick={() => onUpgradeSkill("negotiator")}
                      disabled={
                        managerSkills.skillPoints <= 0 ||
                        managerSkills.negotiator >= 5
                      }
                      className="px-3 py-1 bg-sky-500 hover:bg-sky-450 disabled:bg-slate-800 disabled:text-slate-600 text-black text-[9px] font-black tracking-widest uppercase rounded-md transition-all"
                    >
                      {managerSkills.negotiator >= 5 ? "MAXED" : "UPGRADE"}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Youth Development
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex-1">
                    Accelerates training progression and potential growth for
                    academy/young players.
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-mono font-bold text-sky-400">
                      Lv. {managerSkills.youthDevelopment}
                    </span>
                    <button
                      onClick={() => onUpgradeSkill("youthDevelopment")}
                      disabled={
                        managerSkills.skillPoints <= 0 ||
                        managerSkills.youthDevelopment >= 5
                      }
                      className="px-3 py-1 bg-sky-500 hover:bg-sky-450 disabled:bg-slate-800 disabled:text-slate-600 text-black text-[9px] font-black tracking-widest uppercase rounded-md transition-all"
                    >
                      {managerSkills.youthDevelopment >= 5
                        ? "MAXED"
                        : "UPGRADE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
