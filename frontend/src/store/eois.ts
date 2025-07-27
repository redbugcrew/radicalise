import { createSlice } from "@reduxjs/toolkit";
import type { Eoi } from "../api/Api";

export type EoisState = Eoi[];

const eoisSlice = createSlice({
  name: "eois",
  initialState: [] as EoisState,
  reducers: {
    eoisLoaded: (_state, action) => {
      return action.payload as EoisState;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { eoisLoaded } = eoisSlice.actions;

// Export the slice reducer as the default export
export default eoisSlice.reducer;
