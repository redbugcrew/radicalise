import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Person } from "../api/Api";

export type PeopleState = Person[];

const peopleSlice = createSlice({
  name: "people",
  initialState: [] as PeopleState,
  reducers: {
    peopleLoaded: (_state: PeopleState, action: PayloadAction<Person[]>) => action.payload,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { peopleLoaded } = peopleSlice.actions;

// Export the slice reducer as the default export
export default peopleSlice.reducer;
