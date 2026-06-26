import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Club, Fixture, BracketNode, TrophyRecord, ManagerSkills, NewsItem } from '../../types';

type CupRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F';
type CampaignType = 'league' | 'cup' | 'dual';

interface CampaignState {
  userClubId: string;
  userBalance: number;
  currentWeek: number;
  campaignType: CampaignType;
  allClubs: Club[];
  leagueFixtures: Fixture[];
  tournamentFixtures: Fixture[];
  cupBracket: BracketNode[];
  currentCupRound: CupRound;
  historyTrophies: TrophyRecord[];
  managerSkills: ManagerSkills;
  newsFeed: NewsItem[];
}

const initialManagerSkills: ManagerSkills = {
  xp: 0,
  level: 1,
  skillPoints: 0,
  tacticalMastermind: 0,
  negotiator: 0,
  youthDevelopment: 0,
};

const initialState: CampaignState = {
  userClubId: '',
  userBalance: 5_000_000,
  currentWeek: 1,
  campaignType: 'dual',
  allClubs: [],
  leagueFixtures: [],
  tournamentFixtures: [],
  cupBracket: [],
  currentCupRound: 'R32',
  historyTrophies: [],
  managerSkills: initialManagerSkills,
  newsFeed: [],
};

export const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setUserClubId: (state, action: PayloadAction<string>) => { state.userClubId = action.payload; },
    setUserBalance: (state, action: PayloadAction<number>) => { state.userBalance = action.payload; },
    addBalance: (state, action: PayloadAction<number>) => { state.userBalance += action.payload; },
    setCurrentWeek: (state, action: PayloadAction<number>) => { state.currentWeek = action.payload; },
    setCampaignType: (state, action: PayloadAction<CampaignType>) => { state.campaignType = action.payload; },
    setAllClubs: (state, action: PayloadAction<Club[]>) => { state.allClubs = action.payload; },
    updateClub: (state, action: PayloadAction<Club>) => {
      const idx = state.allClubs.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.allClubs[idx] = action.payload;
    },
    setLeagueFixtures: (state, action: PayloadAction<Fixture[]>) => { state.leagueFixtures = action.payload; },
    updateLeagueFixture: (state, action: PayloadAction<Fixture>) => {
      const idx = state.leagueFixtures.findIndex((f) => f.id === action.payload.id);
      if (idx !== -1) state.leagueFixtures[idx] = action.payload;
    },
    setTournamentFixtures: (state, action: PayloadAction<Fixture[]>) => { state.tournamentFixtures = action.payload; },
    setCupBracket: (state, action: PayloadAction<BracketNode[]>) => { state.cupBracket = action.payload; },
    setCurrentCupRound: (state, action: PayloadAction<CupRound>) => { state.currentCupRound = action.payload; },
    addTrophyRecord: (state, action: PayloadAction<TrophyRecord>) => { state.historyTrophies.push(action.payload); },
    setManagerSkills: (state, action: PayloadAction<ManagerSkills>) => { state.managerSkills = action.payload; },
    addNewsItem: (state, action: PayloadAction<NewsItem>) => {
      state.newsFeed = [action.payload, ...state.newsFeed].slice(0, 50);
    },
    setNewsFeed: (state, action: PayloadAction<NewsItem[]>) => { state.newsFeed = action.payload; },
    resetCampaign: () => initialState,
  },
});

export const {
  setUserClubId, setUserBalance, addBalance, setCurrentWeek, setCampaignType,
  setAllClubs, updateClub, setLeagueFixtures, updateLeagueFixture,
  setTournamentFixtures, setCupBracket, setCurrentCupRound, addTrophyRecord,
  setManagerSkills, addNewsItem, setNewsFeed, resetCampaign,
} = campaignSlice.actions;

export default campaignSlice.reducer;
