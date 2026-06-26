import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from './slices/campaignSlice';
import simulationReducer from './slices/simulationSlice';
import uiReducer from './slices/uiSlice';
import saveReducer from './slices/saveSlice';

export const store = configureStore({
  reducer: {
    campaign: campaignReducer,
    simulation: simulationReducer,
    ui: uiReducer,
    save: saveReducer,
  },
  // Large Club arrays with nested squads make the serialisability check noisy.
  // Disable it in dev for performance; re-enable selectively if debugging state mutations.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
