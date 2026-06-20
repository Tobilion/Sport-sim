import React, { useState } from 'react';
import { 
  Dumbbell, UserCheck, ShoppingCart, UserX, RefreshCw, Sparkles, Search, 
  DollarSign, TrendingUp, Landmark, Award, ShieldAlert, Heart, Activity, ArrowLeftRight, CheckCircle2 
} from 'lucide-react';
import { Club, Player } from '../types';
import { FIRST_NAMES, LAST_NAMES, randRange, generatePlayerAttributes } from '../data/names';
import { SquadPitch } from './SquadPitch';

interface ManagerSuiteProps {
  userClub: Club;
  allClubs: Club[];
  userBalance: number;
  onUpgradeFacilities: (facilityType: 'training' | 'tactics' | 'cardio' | 'medical', cost: number) => void;
  onBuyPlayer: (newPlayer: Player, cost: number) => void;
  onSellPlayer: (playerId: string, value: number) => void;
  onAdjustSquadLineup?: (newSquad: Player[]) => void;
  onAddFunds?: (amount: number) => void;
  onTapPlayer?: (playerId: string) => void;
  onChangeUserMentality?: (mentality: TeamMentalityType) => void;
  onChangeUserFormation?: (formation: TeamFormationType) => void;
}

export const ManagerSuite: React.FC<ManagerSuiteProps> = ({
  userClub,
  allClubs,
  userBalance,
  onUpgradeFacilities,
  onBuyPlayer,
  onSellPlayer,
  onAdjustSquadLineup,
  onAddFunds,
  onTapPlayer,
  onChangeUserMentality,
  onChangeUserFormation
}) => {
  // Inner states
  const [activeSubTab, setActiveSubTab] = useState<'SQUAD' | 'TRANSFERS' | 'FACILITIES' | 'BOARDROOM'>('SQUAD');
  const [scoutedTransferList, setScoutedTransferList] = useState<Player[]>(() => generateInitialTransferMarket());
  const [infoMessage, setInfoMessage] = useState<string>('');

  // Filters State
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratingRange, setRatingRange] = useState<string>('ALL'); // ALL, BRONZE(<75), SILVER(75-82), GOLD(83+)

  // Boardroom interactions state
  const [boardBackingRequested, setBoardBackingRequested] = useState<boolean>(false);
  const [boardBackingResult, setBoardBackingResult] = useState<string>('');
  const [requestedAmount, setRequestedAmount] = useState<number>(3000000);
  const [boardBackingCount, setBoardBackingCount] = useState<number>(0);

  // Generate unique transfer players based on globally verified ranges
  function generateInitialTransferMarket(): Player[] {
    const list: Player[] = [];
    
    // 1. Analyze user squad limits
    const squadGK = userClub?.squad ? userClub.squad.filter(p => p.position === 'GK').length : 1;
    const squadDEF = userClub?.squad ? userClub.squad.filter(p => p.position === 'DEF').length : 4;
    const squadMID = userClub?.squad ? userClub.squad.filter(p => p.position === 'MID').length : 4;
    const squadATT = userClub?.squad ? userClub.squad.filter(p => p.position === 'ATT').length : 2;
    
    // Use an expanded market size of 25 players
    const totalMarketSize = 25;
    const neededPositions: ('GK' | 'DEF' | 'MID' | 'ATT')[] = [];
    
    if (squadGK <= 1) {
      neededPositions.push('GK', 'GK', 'GK', 'GK');
    }
    if (squadDEF < 5) {
      neededPositions.push('DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF');
    }
    if (squadMID < 5) {
      neededPositions.push('MID', 'MID', 'MID', 'MID', 'MID', 'MID');
    }
    if (squadATT < 3) {
      neededPositions.push('ATT', 'ATT', 'ATT', 'ATT', 'ATT', 'ATT');
    }
    
    const standardPositions: ('GK' | 'DEF' | 'MID' | 'ATT')[] = ['GK', 'DEF', 'MID', 'ATT'];
    while (neededPositions.length < totalMarketSize) {
      neededPositions.push(standardPositions[randRange(0, standardPositions.length - 1)]);
    }
    
    const finalPositions = neededPositions.slice(0, totalMarketSize);
    
    finalPositions.forEach((pos, idx) => {
      const fName = FIRST_NAMES[randRange(0, FIRST_NAMES.length - 1)];
      const lName = LAST_NAMES[randRange(0, LAST_NAMES.length - 1)];
      const rating = randRange(70, 92);
      
      const valFactor = Math.pow(rating - 55, 3.1) * 12500;
      const calculatedValue = Math.round(valFactor / 50000) * 50000 + randRange(0, 4) * 15000;

      list.push({
        id: `transfer-player-${idx}-${Date.now()}-${randRange(100, 999)}`,
        name: `${fName} ${lName}`,
        position: pos,
        rating,
        stamina: 100,
        morale: 100,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        matchRatings: [],
        marketValue: calculatedValue > 100000 ? calculatedValue : randRange(150, 290) * 1000,
        attributes: generatePlayerAttributes(pos, rating),
        isStarting: false
      });
    });
    return list;
  }

  const handleRefreshScouting = () => {
    setScoutedTransferList(generateInitialTransferMarket());
    showMessage('Scouted fresh elite players on the free transfer list!');
  };

  const showMessage = (msg: string) => {
    setInfoMessage(msg);
    setTimeout(() => setInfoMessage(''), 3500);
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
      const updatedSquad = userClub.squad.map(p => {
        if (p.id === starterId) {
          return { ...p, isStarting: false };
        }
        if (p.id === benchId) {
          return { ...p, isStarting: true };
        }
        return p;
      });

      const finalStartingCount = updatedSquad.filter(p => p.isStarting).length;
      const finalGKCount = updatedSquad.filter(p => p.isStarting && p.position === 'GK').length;

      if (finalStartingCount === 11 && finalGKCount === 1) {
        onAdjustSquadLineup(updatedSquad);
        showMessage('Squad formations swapped successfully! Team sheet updated.');
      } else {
        onAdjustSquadLineup(updatedSquad);
        showMessage('Squad swapped. Maintain active team sheet configurations.');
      }
    }
  };

  // Buy Player
  const buyPlayerFromMarket = (player: Player) => {
    if (userClub.squad.length >= 20) {
      showMessage('Your active squad size is at the legal capacity limit of 20 players!');
      return;
    }
    if (userBalance < player.marketValue) {
      showMessage('Insufficient virtual club credit funds to authorize buyout transfer!');
      return;
    }

    onBuyPlayer(player, player.marketValue);
    setScoutedTransferList(scoutedTransferList.filter(p => p.id !== player.id));
    showMessage(`Acquired ${player.name} (${player.position}) into your roster!`);
  };

  // Sell Player
  const sellPlayerFromSquad = (player: Player) => {
    if (userClub.squad.length <= 13) {
      showMessage('League regulations require at least 13 players in your squad roster!');
      return;
    }

    // Starters must be converted to bench before sellout
    if (player.isStarting) {
      showMessage('Convert player to substitute bench player before selling!');
      return;
    }

    onSellPlayer(player.id, player.marketValue);
    showMessage(`Sold ${player.name} for $${player.marketValue.toLocaleString()} transfer profit.`);
  };

  const getApprovalProbability = (amt: number, count: number) => {
    // First 3 requests have "no consequences" (higher baseline approval)
    if (count < 3) {
      if (amt <= 100000000) return 98; // 98% approval up to 100M
      if (amt <= 250000000) return 85; // 85% approval up to 250M
      if (amt <= 500000000) return 70; // 70% approval up to 500M
      return 50;                       // 50% approval above 500M
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
    
    setBoardBackingCount(prev => prev + 1);

    if (roll <= chance) {
      if (onAddFunds) {
        onAddFunds(requestedAmount);
      }
      setBoardBackingResult(`PROPOSAL APPROVED: The board has voted to authorize your capital application for $${requestedAmount.toLocaleString()}! The sum has been added to your balance. (Approval Chance was ${chance}%, rolled ${roll})`);
      showMessage(`Capital injection of $${requestedAmount.toLocaleString()} added!`);
    } else {
      setBoardBackingResult(`PROPOSAL DECLINED: The board has formally rejected your request for $${requestedAmount.toLocaleString()}. The directors stated that the quantity is too large for the current risk profile. Try asking for a lower sum or performing better in matches. (Approval Chance was ${chance}%, rolled ${roll})`);
    }
  };

  // Filter transfers list
  const filteredTransfers = scoutedTransferList.filter(item => {
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = posFilter === 'ALL' || item.position === posFilter;
    
    let matchesRating = true;
    if (ratingRange === 'BRONZE') matchesRating = item.rating < 74;
    else if (ratingRange === 'SILVER') matchesRating = item.rating >= 74 && item.rating <= 82;
    else if (ratingRange === 'GOLD') matchesRating = item.rating >= 83;

    return matchesQuery && matchesPos && matchesRating;
  });

  return (
    <div className="space-y-6 select-none animate-fadeIn text-left">
      {/* Tab Selectors */}
      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('SQUAD')}
          className={`flex-1 py-2 text-xs uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === 'SQUAD' ? 'bg-sky-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Squad Team Sheet
        </button>
        <button
          onClick={() => setActiveSubTab('TRANSFERS')}
          className={`flex-1 py-2 text-xs uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === 'TRANSFERS' ? 'bg-sky-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Transfer Market Portal
        </button>
        <button
          onClick={() => setActiveSubTab('FACILITIES')}
          className={`flex-1 py-2 text-xs uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === 'FACILITIES' ? 'bg-sky-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upgradable Facilities
        </button>
        <button
          onClick={() => setActiveSubTab('BOARDROOM')}
          className={`flex-1 py-2 text-xs uppercase font-black tracking-wider rounded-lg text-center cursor-pointer transition-all ${
            activeSubTab === 'BOARDROOM' ? 'bg-sky-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Boardroom & Management
        </button>
      </div>

      {infoMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2.5 font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* SQUAD SHEET VIEW */}
      {activeSubTab === 'SQUAD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121620] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Roster Size</span>
                <h4 className="text-2xl font-mono font-black text-white mt-1">{userClub.squad.length} / 20 Registered</h4>
              </div>
              <UserCheck className="w-8 h-8 text-sky-400 opacity-60" />
            </div>

            <div className="bg-[#121620] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current OVR Rating</span>
                <h4 className="text-2xl font-mono font-black text-emerald-400 mt-1">
                  {Math.round(userClub.squad.reduce((s, p) => s + p.rating, 0) / userClub.squad.length)} OVR
                </h4>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>

            <div className="bg-[#121620] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tactical Manager</span>
                <h4 className="text-md font-mono font-black text-amber-500 mt-1">{userClub.coach.name}</h4>
                <span className="text-[9px] text-slate-400">Class A Head Coach ({userClub.coach.specialty})</span>
              </div>
              <Award className="w-8 h-8 text-amber-500 opacity-60" />
            </div>
          </div>

          <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3 md:mb-0">
                📋 ACTIVE REGISTERED TEAM SHEET (11 Starters + Substitutes Bench)
              </h3>
              
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Formation:</span>
                  <select 
                    value={userClub.formation || '4-3-3'}
                    onChange={(e) => onChangeUserFormation?.(e.target.value as any)}
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
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Mentality:</span>
                  <select 
                    value={userClub.mentality}
                    onChange={(e) => onChangeUserMentality?.(e.target.value as any)}
                    className="bg-slate-900 border border-white/10 text-xs font-bold text-amber-500 py-1.5 px-3 rounded-lg outline-none custom-scrollbar"
                  >
                    <option value="Balanced">Balanced</option>
                    <option value="Attacking">Attacking</option>
                    <option value="Defensive">Defensive</option>
                    <option value="Gegenpressing">Gegenpressing</option>
                    <option value="Park the Bus">Park the Bus</option>
                    <option value="Tiki-Taka">Tiki-Taka</option>
                  </select>
                </div>
              </div>
            </div>
            
            <SquadPitch 
              squad={userClub.squad} 
              mentality={userClub.mentality} 
              formation={userClub.formation || '4-3-3'}
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
                  {userClub.squad.map(player => {
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
                                <span className="bg-[#22c55e]/15 text-[#22c55e] inline-block px-1 rounded-sm text-[8px] font-black uppercase">Active Starter</span>
                              ) : (
                                <span className="bg-slate-800/80 text-slate-500 inline-block px-1 rounded-sm text-[8px] font-black uppercase">Sub bench</span>
                              )}
                              ID: #{player.id.substring(player.id.lastIndexOf('-') + 1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                            player.position === 'GK' ? 'bg-orange-500/20 text-orange-400' :
                            player.position === 'DEF' ? 'bg-sky-500/20 text-sky-400' :
                            player.position === 'MID' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-rose-500/20 text-rose-450'
                          }`}>
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
                            <span className={`font-mono font-bold ${player.stamina < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>{Math.round(player.stamina)}%</span>
                            <div className="w-14 bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-emerald-500" style={{ width: `${player.stamina}%`, backgroundColor: player.stamina < 60 ? '#f43f5e' : '#10b981' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-center font-mono text-slate-400 font-bold">
                          {player.goals} Goals / {player.assists} Asts
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex gap-2 text-[8px] text-slate-500 font-mono justify-center">
                            <span>PAC: <strong className="text-slate-300">{player.attributes?.pace || player.rating}</strong></span>
                            <span>SHO: <strong className="text-slate-300">{player.attributes?.shooting || player.rating}</strong></span>
                            <span>PAS: <strong className="text-slate-300">{player.attributes?.passing || player.rating}</strong></span>
                            <span>DEF: <strong className="text-slate-300">{player.attributes?.defending || player.rating}</strong></span>
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
      {activeSubTab === 'TRANSFERS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-sky-400" />
                Active Global Scout Database
              </h3>
              <button
                onClick={handleRefreshScouting}
                className="py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Scouts
              </button>
            </div>

            {/* Filters Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs font-semibold">
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-500"><Search className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="Insert player surname..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/10 text-white rounded-lg p-2.5 pl-10 outline-none focus:border-sky-500 transition-all font-medium"
                />
              </div>

              <div>
                <select
                  value={posFilter}
                  onChange={e => setPosFilter(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-sky-500 transition-all cursor-pointer"
                >
                  <option value="ALL">All Tactical Positions</option>
                  <option value="GK">GK (Goalkeepers)</option>
                  <option value="DEF">DEF (Defenders)</option>
                  <option value="MID">MID (Midfielders)</option>
                  <option value="ATT">ATT (Strikers/Attackers)</option>
                </select>
              </div>

              <div>
                <select
                  value={ratingRange}
                  onChange={e => setRatingRange(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/10 text-white rounded-lg p-2.5 outline-none focus:border-sky-500 transition-all cursor-pointer"
                >
                  <option value="ALL">All Skill OVR Indexes</option>
                  <option value="BRONZE">Prospects (&lt; 74 OVR)</option>
                  <option value="SILVER">Contenders (74 - 82 OVR)</option>
                  <option value="GOLD">Champions (83+ OVR)</option>
                </select>
              </div>

              <div className="bg-[#1c2230] rounded-lg p-2.5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-500 uppercase font-mono text-[9px]">YOUR FUNDS:</span>
                <strong className="text-amber-500 font-extrabold font-mono text-sm">${userBalance.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTransfers.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-[#121620] border border-dashed border-white/10 rounded-2xl text-slate-500 font-mono text-xs italic">
                No players match your search criteria. Try altering your filters or refresh the scouts feed.
              </div>
            ) : (
              filteredTransfers.map(item => (
                <div 
                  key={item.id} 
                  className="bg-gradient-to-b from-[#121620] to-[#0c0f16] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500/50 transition-all relative group shadow-lg"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                        item.position === 'GK' ? 'bg-orange-500/20 text-orange-400 border border-orange-450/10' :
                        item.position === 'DEF' ? 'bg-sky-500/20 text-sky-450 border border-sky-450/10' :
                        item.position === 'MID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-450/10' :
                        'bg-rose-500/20 text-rose-450 border border-rose-450/10'
                      }`}>
                        {item.position}
                      </span>
                      <strong className="text-xl font-black font-mono text-white tracking-tighter bg-white/5 shrink-0 px-2.5 py-0.5 rounded-lg border border-white/10">
                        {item.rating}
                      </strong>
                    </div>

                    <h4 
                      onClick={() => onTapPlayer?.(item.id)}
                      className="text-sm font-black text-white hover:underline cursor-pointer tracking-tight truncate hover:text-sky-400"
                    >
                      {item.name}
                    </h4>

                    {/* Progress bars attributes */}
                    <div className="space-y-1.5 my-4 pt-2.5 border-t border-white/5 text-[9px] font-mono text-slate-400">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>PACE QUALITIES:</span>
                          <strong>{item.attributes.pace}</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: `${item.attributes.pace}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>SHOOTING CLINICAL:</span>
                          <strong>{item.attributes.shooting}</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${item.attributes.shooting}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>PASSING ACCURACY:</span>
                          <strong>{item.attributes.passing}</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${item.attributes.passing}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col gap-2 shrink-0">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-slate-500">Value Tag:</span>
                      <span className="text-amber-500 text-sm">${item.marketValue.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => buyPlayerFromMarket(item)}
                      disabled={userBalance < item.marketValue}
                      className="w-full mt-2 py-2 bg-sky-500 hover:bg-sky-450 disabled:bg-slate-800 disabled:opacity-40 disabled:text-slate-600 text-black uppercase font-black text-[10px] tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      AUTHORIZED TRANSFER
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FACILITIES VIEW */}
      {activeSubTab === 'FACILITIES' && (
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-5 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>
          
          <div className="border-b border-white/5 pb-3 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-500 animate-pulse" />
              Club Facility Infrastructure Upgrades
            </h3>
            <p className="text-xs text-slate-550 mt-1">Investing in premium facilities locks permanent boosts to training rate, stamina retention, tactics, or physical recovery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Defensive / Skill Ground */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">Training Ground</span>
                  <span className="text-xs font-mono font-bold text-amber-500">Lvl {userClub.trainingFacilities}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  Boosts defensive stats, and increases rating growth curves for the youth squads.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, userClub.trainingFacilities * 20)}%` }}></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities('training', trainingCost)}
                disabled={userBalance < trainingCost || userClub.trainingFacilities >= 5}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {userClub.trainingFacilities >= 5 ? 'MAX LEVEL reached' : `UPGRADE FOR $${trainingCost.toLocaleString()}`}
              </button>
            </div>

            {/* Tactics Room */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">Tactics Analytics Room</span>
                  <span className="text-xs font-mono font-bold text-sky-400">Lvl {userClub.tacticsFacilities}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  Advanced tactical workshops boost passing accuracy, Tiki-Taka control, and goalie strike box results.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-sky-500" style={{ width: `${Math.min(100, userClub.tacticsFacilities * 20)}%` }}></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities('tactics', tacticsCost)}
                disabled={userBalance < tacticsCost || userClub.tacticsFacilities >= 5}
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {userClub.tacticsFacilities >= 5 ? 'MAX LEVEL reached' : `UPGRADE FOR $${tacticsCost.toLocaleString()}`}
              </button>
            </div>

            {/* Cardio physiology */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">Cardio Physiology Gym</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">Lvl {userClub.cardioFacilities}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  氧 Oxygen retention conditioning. Slows down player stamina match fatigue decay curves by 8% per level.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, userClub.cardioFacilities * 20)}%` }}></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities('cardio', cardioCost)}
                disabled={userBalance < cardioCost || userClub.cardioFacilities >= 5}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {userClub.cardioFacilities >= 5 ? 'MAX LEVEL reached' : `UPGRADE FOR $${cardioCost.toLocaleString()}`}
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
                  <span className="text-xs font-mono font-bold text-rose-450">Lvl {userClub.medicalFacilities || 1}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 h-12">
                  Provides high-level sports physical therapy. Accelerates squad stamina weekly recovery rates after heavy matchdays.
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, (userClub.medicalFacilities || 1) * 20)}%` }}></div>
                </div>
              </div>
              <button
                onClick={() => onUpgradeFacilities('medical', medicalCost)}
                disabled={userBalance < medicalCost || (userClub.medicalFacilities || 1) >= 5}
                className="w-full py-2 bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-black uppercase tracking-wider font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
              >
                {(userClub.medicalFacilities || 1) >= 5 ? 'MAX LEVEL reached' : `UPGRADE FOR $${medicalCost.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOARDROOM VIEW */}
      {activeSubTab === 'BOARDROOM' && (
        <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 relative overflow-hidden animate-fadeIn space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <Landmark className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Executive Club Boardroom</h3>
                <p className="text-xs text-slate-400 mt-1">Review contractual objectives, manager standing ratings, and request critical emergency funding.</p>
              </div>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Board Status Rating</span>
              <strong className="text-sm font-black text-emerald-400 block uppercase mt-0.5">secured (EXCELLENT)</strong>
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
                  <span className="text-white font-bold">First Team Manager</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Contract Term Duration:</span>
                  <span className="text-sky-400 font-bold">3 Years Remaining</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Board Approval Rate:</span>
                  <span className="text-emerald-400 font-bold">88.5% (Trustworthy)</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Primary Objective:</span>
                  <span className="text-amber-500 font-bold">Maintain safe standing & qualify Cup</span>
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
                  Submit a customized capital projection plan. Funding requests carry dynamic director approval rates based strictly on the requested volume. Over-requesting harms board trust.
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
                      onChange={(e) => setRequestedAmount(Math.max(50000, Number(e.target.value)))}
                      className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-sky-500 flex-1"
                    />
                  </div>
                </div>

                {/* Predefined Quick Amounts */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[10000000, 50000000, 100000000, 250000000, 500000000].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      onClick={() => setRequestedAmount(quickAmt)}
                      className={`px-2 py-1 text-[9px] uppercase font-mono font-extrabold rounded border transition-all cursor-pointer ${
                        requestedAmount === quickAmt
                          ? 'bg-sky-500/20 text-sky-400 border-sky-400'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      ${quickAmt >= 1000000 ? `${(quickAmt / 1000000).toFixed(0)}M` : `${(quickAmt / 1000).toFixed(0)}K`}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-xs">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-500">REQUEST LIKELIHOOD FACTOR:</span>
                    <span className={`font-black uppercase ${
                      getApprovalProbability(requestedAmount, boardBackingCount) >= 80 ? 'text-emerald-400' :
                      getApprovalProbability(requestedAmount, boardBackingCount) >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {getApprovalProbability(requestedAmount, boardBackingCount)}% (PROBABILITY)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        getApprovalProbability(requestedAmount, boardBackingCount) >= 80 ? 'bg-emerald-505 bg-emerald-500' :
                        getApprovalProbability(requestedAmount, boardBackingCount) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${getApprovalProbability(requestedAmount, boardBackingCount)}%` }}
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
              <p className="text-[11.5px] text-slate-350">{boardBackingResult}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
