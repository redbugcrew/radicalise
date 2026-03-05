import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "../api/Api";

export type ProjectState = Project | null;

const projectSlice = createSlice({
  name: "project",
  initialState: null as ProjectState,
  reducers: {
    projectLoaded: (_state: ProjectState, action: PayloadAction<Project>) => action.payload,
    projectUpdated: (_state: ProjectState, action: PayloadAction<Project>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { projectLoaded, projectUpdated } = projectSlice.actions;

// Export the slice reducer as the default export
export default projectSlice.reducer;
