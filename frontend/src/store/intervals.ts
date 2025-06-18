import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Interval } from "../api/Api";
import { produce } from "immer";
import { DateOnly } from "@urbdyn/date-only";

export interface DateInterval {
  id: number;
  end_date: DateOnly;
  start_date: DateOnly;
}

export type IntervalsState = {
  allIntervals: DateInterval[];
  currentInterval: DateInterval | null;
};

function buildDateInterval(interval: Interval): DateInterval {
  return {
    id: interval.id,
    start_date: DateOnly.fromString(interval.start_date),
    end_date: DateOnly.fromString(interval.end_date),
  };
}

function buildDateIntervals(intervals: Interval[]): DateInterval[] {
  return intervals.map(buildDateInterval);
}

function timestampInInterval(timestamp: number, interval: DateInterval): boolean {
  return timestamp >= interval.start_date.startEpoch && timestamp <= interval.end_date.endEpoch;
}

function getCurrentInterval(intervals: DateInterval[]): DateInterval | null {
  const timestamp = Date.now();

  return intervals.find((interval) => timestampInInterval(timestamp, interval)) || null;
}

const intervalsSlice = createSlice({
  name: "people",
  initialState: {
    allIntervals: [],
    currentInterval: null,
  } as IntervalsState,
  reducers: {
    intervalsLoaded: (state: IntervalsState, action: PayloadAction<Interval[]>) => {
      const dateIntervals = buildDateIntervals(action.payload);

      return produce(state, (draft) => {
        draft.allIntervals = dateIntervals;
        draft.currentInterval = getCurrentInterval(dateIntervals);
      });
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { intervalsLoaded } = intervalsSlice.actions;

// Export the slice reducer as the default export
export default intervalsSlice.reducer;
