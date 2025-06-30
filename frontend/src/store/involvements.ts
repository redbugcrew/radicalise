import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CollectiveInvolvement, CollectiveInvolvementWithDetails, IntervalInvolvementData, MyIntervalData } from "../api/Api";

export type InvolvementsState = IntervalInvolvementData | null;

function removeInvolvementDetails(input: CollectiveInvolvementWithDetails): CollectiveInvolvement {
  const { id, collective_id, interval_id, person_id, status } = input;
  return { id, collective_id, interval_id, person_id, status };
}

const involvementsSlice = createSlice({
  name: "involvements",
  initialState: null as InvolvementsState,
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

        if (state.interval_id === payload.interval_id) {
          const new_involvements = state.collective_involvements.filter((inv) => inv.id !== involvement.id);
          return {
            ...state,
            collective_involvements: new_involvements.concat([involvement]),
          };
        }
      }
    );
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { involvementsLoaded } = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
