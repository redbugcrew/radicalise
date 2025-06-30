import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MyInitialData, CollectiveInvolvementWithDetails } from "../api/Api";

export type MeState = MyInitialData;

const meSlice = createSlice({
  name: "me",
  initialState: {
    my_involvements: [] as CollectiveInvolvementWithDetails[],
  } as MyInitialData,
  reducers: {
    meLoaded: (_state: MeState, action: PayloadAction<MeState>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { meLoaded } = meSlice.actions;

// Export the slice reducer as the default export
export default meSlice.reducer;
