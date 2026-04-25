import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Circle } from "../api/Api";

export type CirclesState = Circle[] | null;

const circlesSlice = createSlice({
  name: "circles",
  initialState: null as CirclesState,
  reducers: {
    circlesLoaded: (_state: CirclesState, action: PayloadAction<Circle[]>) => action.payload,
    circleUpdated: (state: CirclesState, action: PayloadAction<Circle>) => {
      if (!state) return state;

      const index = state.findIndex((circle) => circle.id === action.payload.id);
      if (index !== -1) {
        // Update existing circle
        const newState = [...state];
        newState[index] = action.payload;
        return newState;
      } else {
        // Circle not found, add it to the list
        return [...state, action.payload];
      }
    },
  },
});

export const { circlesLoaded, circleUpdated } = circlesSlice.actions;

// Export the slice reducer as the default export
export default circlesSlice.reducer;
