import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CollectiveState } from "../api/Api";

export type CollectiveStoreState = CollectiveState | null;

const collectiveSlice = createSlice({
  name: "collective",
  initialState: null as CollectiveStoreState,
  reducers: {
    collectiveLoaded: (_state: CollectiveStoreState, action: PayloadAction<CollectiveState>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { collectiveLoaded } = collectiveSlice.actions;

// Export the slice reducer as the default export
export default collectiveSlice.reducer;
