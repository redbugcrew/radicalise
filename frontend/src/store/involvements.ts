import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Involvement } from "../api/Api";

export type InvolvementsState = {
  collective_involvements: Involvement[];
};

const involvementsSlice = createSlice({
  name: "involvements",
  initialState: { collective_involvements: [] } as InvolvementsState,
  reducers: {
    involvementsLoaded: (_state: InvolvementsState, action: PayloadAction<InvolvementsState>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { involvementsLoaded } = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
