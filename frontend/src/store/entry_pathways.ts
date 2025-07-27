import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EntryPathway } from "../api/Api";

export type EntryPathwayState = EntryPathway[];

const entryPathwaysSlice = createSlice({
  name: "entryPathways",
  initialState: [] as EntryPathwayState,
  reducers: {
    entryPathwaysLoaded: (_state, action) => {
      return action.payload as EntryPathwayState;
    },
    entryPathwayUpdated: (state, action: PayloadAction<EntryPathway>) => {
      const updatedPathway = action.payload;
      const index = state.findIndex((pathway) => pathway.id === updatedPathway.id);
      if (index !== -1) {
        state[index] = updatedPathway; // Update the existing pathway
      } else {
        state.push(updatedPathway); // Add the new pathway if it doesn't exist
      }
      return state;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { entryPathwaysLoaded, entryPathwayUpdated } = entryPathwaysSlice.actions;

// Export the slice reducer as the default export
export default entryPathwaysSlice.reducer;
