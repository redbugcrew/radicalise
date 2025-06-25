import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Crew } from "../api/Api";

interface CrewObjectMap {
  [key: number]: Crew;
}

export type CrewsState = CrewObjectMap;

const crewsSlice = createSlice({
  name: "crews",
  initialState: {} as CrewsState,
  reducers: {
    crewsLoaded: (_state: CrewsState, action: PayloadAction<Crew[]>) => {
      const crews: CrewObjectMap = {};
      action.payload.forEach((crew) => {
        crews[crew.id] = crew;
      });
      return crews;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { crewsLoaded } = crewsSlice.actions;

// Export the slice reducer as the default export
export default crewsSlice.reducer;
