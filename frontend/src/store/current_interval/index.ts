import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Interval, IntervalData } from "../../api/Api";
import { useAppSelector } from "..";
import { getApi } from "../../api";

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

async function useIntervalData(intervalId: number): Promise<IntervalData | null> {
  const currentInterval = useAppSelector((state) => state.currentInterval);

  if (currentInterval === null || currentInterval.interval.id !== intervalId) {
    return fetchIntervalData(intervalId);
  }
  return currentInterval;
}

async function fetchIntervalData(intervalId: number): Promise<IntervalData | null> {
  return getApi()
    .api.getIntervalData(intervalId)
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("Error fetching interval data:", error);
      return null;
    });
}
