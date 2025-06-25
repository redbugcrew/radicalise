import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Interval } from "../api/Api";
import { useAppSelector } from "./index";

export type IntervalsState = {
  allIntervals: Interval[];
  currentInterval: Interval | null;
};

const intervalsSlice = createSlice({
  name: "people",
  initialState: {
    allIntervals: [],
    currentInterval: null,
  } as IntervalsState,
  reducers: {
    intervalsLoaded: (_state: IntervalsState, action: PayloadAction<IntervalsState>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { intervalsLoaded } = intervalsSlice.actions;

// Export the slice reducer as the default export
export default intervalsSlice.reducer;

export function useNextInterval(): Interval | null {
  const { allIntervals, currentInterval } = useAppSelector((state) => state.intervals);
  if (!currentInterval) return null;

  const currentIntervalIndex = allIntervals.findIndex((i) => i.id === currentInterval.id);
  if (currentIntervalIndex === -1 || currentIntervalIndex === allIntervals.length - 1) {
    return null; // No next interval if current is the last one or not found
  }

  return allIntervals[currentIntervalIndex + 1];
}
