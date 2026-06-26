import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NotificationItem, PostMatchAnalysis } from '../../types';

type TabId = 'MANAGER' | 'NEXT_MATCH' | 'FIXTURES' | 'STANDINGS' | 'ANALYTICS' | 'NEWS' | 'ALL_TEAMS' | 'TROPHIES' | 'SPORTSBOOK';
type FixturesSubTab = 'LEAGUE' | 'TOURNAMENT';
type DossierTab = 'STATS' | 'QUALITIES';

interface UIState {
  currentTab: TabId;
  fixturesSubTab: FixturesSubTab;
  activePlayerDossierId: string | null;
  activeClubDossierId: string | null;
  dossierTypeTab: DossierTab;
  isNotificationDrawerOpen: boolean;
  isSeasonReviewOpen: boolean;
  isHalftimeModalOpen: boolean;
  notifications: NotificationItem[];
  postMatchAnalysis: PostMatchAnalysis | null;
  pendingMoralePlayerIds: string[];
  consecutiveLosses: number;
  showPressureModal: boolean;
}

const initialState: UIState = {
  currentTab: 'MANAGER',
  fixturesSubTab: 'LEAGUE',
  activePlayerDossierId: null,
  activeClubDossierId: null,
  dossierTypeTab: 'STATS',
  isNotificationDrawerOpen: false,
  isSeasonReviewOpen: false,
  isHalftimeModalOpen: false,
  notifications: [],
  postMatchAnalysis: null,
  pendingMoralePlayerIds: [],
  consecutiveLosses: 0,
  showPressureModal: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentTab: (state, action: PayloadAction<TabId>) => { state.currentTab = action.payload; },
    setFixturesSubTab: (state, action: PayloadAction<FixturesSubTab>) => { state.fixturesSubTab = action.payload; },
    setActivePlayerDossierId: (state, action: PayloadAction<string | null>) => { state.activePlayerDossierId = action.payload; },
    setActiveClubDossierId: (state, action: PayloadAction<string | null>) => { state.activeClubDossierId = action.payload; },
    setDossierTypeTab: (state, action: PayloadAction<DossierTab>) => { state.dossierTypeTab = action.payload; },
    setNotificationDrawerOpen: (state, action: PayloadAction<boolean>) => { state.isNotificationDrawerOpen = action.payload; },
    setSeasonReviewOpen: (state, action: PayloadAction<boolean>) => { state.isSeasonReviewOpen = action.payload; },
    setHalftimeModalOpen: (state, action: PayloadAction<boolean>) => { state.isHalftimeModalOpen = action.payload; },
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp' | 'read'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        read: false,
      });
      if (state.notifications.length > 50) state.notifications.pop();
    },
    markNotificationsRead: (state) => {
      state.notifications.forEach((n) => { n.read = true; });
    },
    setPostMatchAnalysis: (state, action: PayloadAction<PostMatchAnalysis | null>) => { state.postMatchAnalysis = action.payload; },
    setPendingMoralePlayerIds: (state, action: PayloadAction<string[]>) => { state.pendingMoralePlayerIds = action.payload; },
    setConsecutiveLosses: (state, action: PayloadAction<number>) => { state.consecutiveLosses = action.payload; },
    setShowPressureModal: (state, action: PayloadAction<boolean>) => { state.showPressureModal = action.payload; },
  },
});

export const {
  setCurrentTab, setFixturesSubTab, setActivePlayerDossierId, setActiveClubDossierId,
  setDossierTypeTab, setNotificationDrawerOpen, setSeasonReviewOpen, setHalftimeModalOpen,
  addNotification, markNotificationsRead, setPostMatchAnalysis, setPendingMoralePlayerIds,
  setConsecutiveLosses, setShowPressureModal,
} = uiSlice.actions;

export default uiSlice.reducer;
