import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MyInitialData } from "../api/Api";

export type MeState = MyInitialData | null;

const meSlice = createSlice({
  name: "me",
  initialState: null as MeState,
  reducers: {
    meLoaded: (_state: MeState, action: PayloadAction<MeState>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { meLoaded } = meSlice.actions;

// Export the slice reducer as the default export
export default meSlice.reducer;
