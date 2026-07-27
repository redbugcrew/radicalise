import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Interval, IntervalData } from "../../api/Api";
import { useAppSelector } from "..";

export type CurrentIntervalState = IntervalData | null;

const currentIntervalSlice = createSlice({
  name: "current_interval",
  initialState: null as CurrentIntervalState,
  reducers: {
    currentIntervalLoaded: (_state: CurrentIntervalState, action: PayloadAction<IntervalData>) => {
      return action.payload;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { currentIntervalLoaded } = currentIntervalSlice.actions;

// Export the slice reducer as the default export
export default currentIntervalSlice.reducer;

export function useCurrentInterval(): Interval | null {
  const currentInterval = useAppSelector((state) => state.currentInterval?.interval);
  return currentInterval ?? null;
}
