import { createSlice } from "@reduxjs/toolkit";
import type { EntryPathway } from "../api/Api";

export type EntryPathwayState = EntryPathway[];

const entryPathwaysSlice = createSlice({
  name: "entryPathways",
  initialState: [] as EntryPathwayState,
  reducers: {
    entryPathwaysLoaded: (_state, action) => {
      return action.payload as EntryPathwayState;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { entryPathwaysLoaded } = entryPathwaysSlice.actions;

// Export the slice reducer as the default export
export default entryPathwaysSlice.reducer;
