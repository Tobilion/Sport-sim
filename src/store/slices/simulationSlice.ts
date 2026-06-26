import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LiveMatchSimulation } from '../../types';

interface SimulationState {
  activeSimulation: LiveMatchSimulation | null;
  isPlaying: boolean;
  simSpeed: number; // ms per tick
  simMessage: string;
}

const initialState: SimulationState = {
  activeSimulation: null,
  isPlaying: false,
  simSpeed: 1000,
  simMessage: '',
};

export const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    setActiveSimulation: (state, action: PayloadAction<LiveMatchSimulation | null>) => {
      state.activeSimulation = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => { state.isPlaying = action.payload; },
    setSimSpeed: (state, action: PayloadAction<number>) => { state.simSpeed = action.payload; },
    setSimMessage: (state, action: PayloadAction<string>) => { state.simMessage = action.payload; },
    clearSimulation: (state) => {
      state.activeSimulation = null;
      state.isPlaying = false;
      state.simMessage = '';
    },
  },
});

export const { setActiveSimulation, setIsPlaying, setSimSpeed, setSimMessage, clearSimulation } =
  simulationSlice.actions;

export default simulationSlice.reducer;
