import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CollectiveInvolvement, CollectiveInvolvementWithDetails, MyIntervalData, InvolvementData } from "../api/Api";

export type InvolvementsState = InvolvementData;

function removeInvolvementDetails(input: CollectiveInvolvementWithDetails): CollectiveInvolvement {
  const { id, collective_id, interval_id, person_id, status } = input;
  return { id, collective_id, interval_id, person_id, status };
}

function upsertCollectiveInvolvement(involvements: CollectiveInvolvement[], newInvolvement: CollectiveInvolvement): CollectiveInvolvement[] {
  const existingIndex = involvements.findIndex((inv) => inv.id === newInvolvement.id);
  if (existingIndex !== -1) {
    // Update existing involvement
    return involvements.map((inv, index) => (index === existingIndex ? newInvolvement : inv));
  } else {
    // Add new involvement
    return [...involvements, newInvolvement];
  }
}

const involvementsSlice = createSlice({
  name: "involvements",
  initialState: {
    current_interval: null,
    next_interval: null,
  } as InvolvementsState,
  reducers: {
    involvementsLoaded: (_state: InvolvementsState, action: PayloadAction<InvolvementsState>) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is PayloadAction<MyIntervalData> => action.type === "me/myIntervalDataChanged",
      (state, { payload }) => {
        if (!state || !payload) return state;

        const detailedInvolvement = payload.collective_involvement;
        if (!detailedInvolvement) return state;
        const involvement = removeInvolvementDetails(detailedInvolvement);

        if (state.current_interval && state.current_interval.interval_id === payload.interval_id) {
          const new_involvements = upsertCollectiveInvolvement(state.current_interval.collective_involvements, involvement);
          return {
            ...state,
            current_interval: {
              ...state.current_interval,
              collective_involvements: new_involvements,
            },
          };
        }

        if (state.next_interval && state.next_interval.interval_id === payload.interval_id) {
          const new_involvements = upsertCollectiveInvolvement(state.next_interval.collective_involvements, involvement);
          return {
            ...state,
            next_interval: {
              ...state.next_interval,
              collective_involvements: new_involvements,
            },
          };
        }

        return state;
      }
    );
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { involvementsLoaded } = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
