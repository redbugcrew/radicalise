import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PersonIntervalInvolvementData, MyInitialData } from "../api/Api";

export type MeState = MyInitialData | null;

const meSlice = createSlice({
  name: "me",
  initialState: null as MeState,
  reducers: {
    meLoaded: (_state: MeState, action: PayloadAction<MeState>) => action.payload,
    myIntervalDataChanged: (state: MeState, action: PayloadAction<PersonIntervalInvolvementData>) => {
      const payload = action.payload;

      if (state && payload) {
        if (state.current_interval && state.current_interval.interval_id === payload.interval_id) {
          return {
            ...state,
            current_interval: payload,
          };
        }
        if (state.next_interval && state.next_interval.interval_id === payload.interval_id) {
          return {
            ...state,
            next_interval: payload,
          };
        }
      }
      return state;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { meLoaded, myIntervalDataChanged } = meSlice.actions;

// Export the slice reducer as the default export
export default meSlice.reducer;
