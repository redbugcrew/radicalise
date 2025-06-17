import { createSlice } from "@reduxjs/toolkit";

interface Collective {
  id: number;
  name: string;
}

export type CollectiveState = Collective | null;

const initialState: CollectiveState = null;

const collectiveSlice = createSlice({
  name: "collective",
  initialState,
  reducers: {
    collectiveLoaded: (_state, action) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { collectiveLoaded } = collectiveSlice.actions;

// Export the slice reducer as the default export
export default collectiveSlice.reducer;
