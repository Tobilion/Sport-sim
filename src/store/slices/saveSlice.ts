import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CampaignType = 'league' | 'cup' | 'dual';

export interface SaveSlot {
  id: string;
  managerName: string;
  clubId: string;
  clubName: string;
  campaignType: CampaignType;
  season: number;
  week: number;
  balance: number;
  savedAt: number;
  // Serialised game state stored alongside the slot metadata
  snapshot?: string;
}

interface SaveState {
  saveSlots: SaveSlot[];
  activeSlotId: string | null;
  // New-slot form state
  newManagerName: string;
  newSelectedClubId: string;
  newCampaignType: CampaignType;
  isCreatingNewSlot: boolean;
  saveToDelete: string | null;
}

const initialState: SaveState = {
  saveSlots: [],
  activeSlotId: null,
  newManagerName: '',
  newSelectedClubId: 'club-1',
  newCampaignType: 'dual',
  isCreatingNewSlot: false,
  saveToDelete: null,
};

export const saveSlice = createSlice({
  name: 'save',
  initialState,
  reducers: {
    setSaveSlots: (state, action: PayloadAction<SaveSlot[]>) => { state.saveSlots = action.payload; },
    upsertSaveSlot: (state, action: PayloadAction<SaveSlot>) => {
      const idx = state.saveSlots.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) state.saveSlots[idx] = action.payload;
      else state.saveSlots.push(action.payload);
    },
    deleteSaveSlot: (state, action: PayloadAction<string>) => {
      state.saveSlots = state.saveSlots.filter((s) => s.id !== action.payload);
      if (state.activeSlotId === action.payload) state.activeSlotId = null;
    },
    setActiveSlotId: (state, action: PayloadAction<string | null>) => { state.activeSlotId = action.payload; },
    setNewManagerName: (state, action: PayloadAction<string>) => { state.newManagerName = action.payload; },
    setNewSelectedClubId: (state, action: PayloadAction<string>) => { state.newSelectedClubId = action.payload; },
    setNewCampaignType: (state, action: PayloadAction<CampaignType>) => { state.newCampaignType = action.payload; },
    setIsCreatingNewSlot: (state, action: PayloadAction<boolean>) => { state.isCreatingNewSlot = action.payload; },
    setSaveToDelete: (state, action: PayloadAction<string | null>) => { state.saveToDelete = action.payload; },
  },
});

export const {
  setSaveSlots, upsertSaveSlot, deleteSaveSlot, setActiveSlotId,
  setNewManagerName, setNewSelectedClubId, setNewCampaignType,
  setIsCreatingNewSlot, setSaveToDelete,
} = saveSlice.actions;

export default saveSlice.reducer;
