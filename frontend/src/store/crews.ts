import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CrewWithLinks as CrewWithAnyLinks, Link } from "../api/Api";

export type CrewWithLinks = CrewWithAnyLinks & {
  links: Link[] | undefined;
};

export interface CrewObjectMap {
  [key: number]: CrewWithLinks;
}

export type CrewsState = CrewObjectMap;

export function crewsArrayFromObjectMap(crewsMap: CrewObjectMap): CrewWithLinks[] {
  return Object.values(crewsMap);
}

const crewsSlice = createSlice({
  name: "crews",
  initialState: {} as CrewsState,
  reducers: {
    crewsLoaded: (_state: CrewsState, action: PayloadAction<CrewWithAnyLinks[]>) => {
      const crews: CrewObjectMap = {};
      action.payload.forEach((crew) => {
        crews[crew.id] = crew as CrewWithLinks;
      });
      return crews;
    },
    crewUpdated: (state: CrewsState, action: PayloadAction<CrewWithAnyLinks>) => {
      state[action.payload.id] = action.payload as CrewWithLinks;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { crewsLoaded, crewUpdated } = crewsSlice.actions;

// Export the slice reducer as the default export
export default crewsSlice.reducer;
