import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Circle } from "../api/Api";

export type CirclesState = Circle[] | null;

const circlesSlice = createSlice({
  name: "circles",
  initialState: null as CirclesState,
  reducers: {
    circlesLoaded: (_state: CirclesState, action: PayloadAction<Circle[]>) => action.payload,
  },
});

export const { circlesLoaded } = circlesSlice.actions;

// Export the slice reducer as the default export
export default circlesSlice.reducer;
