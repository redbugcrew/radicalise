import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Collective } from "../api/Api";

export type CollectiveState = Collective | null;

const collectiveSlice = createSlice({
  name: "collective",
  initialState: null as CollectiveState,
  reducers: {
    collectiveLoaded: (_state: CollectiveState, action: PayloadAction<Collective>) => action.payload,
    collectiveUpdated: (_state: CollectiveState, action: PayloadAction<Collective>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { collectiveLoaded, collectiveUpdated } = collectiveSlice.actions;

// Export the slice reducer as the default export
export default collectiveSlice.reducer;
