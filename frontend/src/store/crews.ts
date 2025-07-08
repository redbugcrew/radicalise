import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CrewWithLinks as CrewWithAnyLinks, Link } from "../api/Api";

export type CrewWithLinks = CrewWithAnyLinks & {
  links: Link[] | undefined;
};

interface CrewObjectMap {
  [key: number]: CrewWithLinks;
}

export type CrewsState = CrewObjectMap;

const crewsSlice = createSlice({
  name: "crews",
  initialState: {} as CrewsState,
  reducers: {
    crewsLoaded: (_state: CrewsState, action: PayloadAction<CrewWithLinks[]>) => {
      const crews: CrewObjectMap = {};
      action.payload.forEach((crew) => {
        crews[crew.id] = crew;
      });
      return crews;
    },
    crewUpdated: (state: CrewsState, action: PayloadAction<CrewWithLinks>) => {
      state[action.payload.id] = action.payload;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { crewsLoaded, crewUpdated } = crewsSlice.actions;

// Export the slice reducer as the default export
export default crewsSlice.reducer;
