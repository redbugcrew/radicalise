import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CircleInvolvement, Interval, IntervalData, PersonIntervalData } from "../../api/Api";
import { useAppSelector } from "..";
import { forCircle, updatePersonCircleInvolvements, upsertCircleData, upsertCircleInvolvement } from "./circle_involvements";
import { updatePersonCrewInvolvements } from "./crew_involvements";

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
    personIntervalDataChanged: (state: CurrentIntervalState, action: PayloadAction<PersonIntervalData>) => {
      let payload = action.payload;
      if (!state || !payload) return state;

      const person_id = payload.person_id;
      const interval_id = payload.data.interval.id;

      if (state.interval.id !== interval_id) return state;

      return {
        ...state,
        circle_involvements: updatePersonCircleInvolvements(state.circle_involvements, payload.data.circle_involvements, person_id),
        crew_involvements: updatePersonCrewInvolvements(state.crew_involvements, payload.data.crew_involvements, person_id),
      };
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { currentIntervalLoaded, circleInvolvementUpdated, personIntervalDataChanged } = currentIntervalSlice.actions;

// Export the slice reducer as the default export
export default currentIntervalSlice.reducer;

export function useCurrentInterval(): Interval | null {
  const currentInterval = useAppSelector((state) => state.currentInterval?.interval);
  return currentInterval ?? null;
}
