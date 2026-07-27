import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CircleInvolvement, Interval, IntervalData } from "../../api/Api";
import { useAppSelector } from "..";
import { forCircle, upsertCircleData, upsertCircleInvolvement } from "./circle_involvements";

export type CurrentIntervalState = IntervalData | null;

const currentIntervalSlice = createSlice({
  name: "current_interval",
  initialState: null as CurrentIntervalState,
  reducers: {
    currentIntervalLoaded: (_state: CurrentIntervalState, action: PayloadAction<IntervalData>) => {
      return action.payload;
    },
    circleInvolvementUpdated: (state: CurrentIntervalState, action: PayloadAction<CircleInvolvement>) => {
      let involvement = action.payload;
      if (!state || !involvement) return state;

      if (state.interval.id !== involvement.interval_id) return state;

      const circleData = forCircle(state.circle_involvements, involvement.circle_id);
      if (!circleData) return state;

      const newCircleData = upsertCircleInvolvement(circleData, involvement);
      const newCircleInvolvements = upsertCircleData(state.circle_involvements, newCircleData);

      return {
        ...state,
        circle_involvements: newCircleInvolvements,
      };
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { currentIntervalLoaded, circleInvolvementUpdated } = currentIntervalSlice.actions;

// Export the slice reducer as the default export
export default currentIntervalSlice.reducer;

export function useCurrentInterval(): Interval | null {
  const currentInterval = useAppSelector((state) => state.currentInterval?.interval);
  return currentInterval ?? null;
}
