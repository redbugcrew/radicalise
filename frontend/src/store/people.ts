import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Person } from "../api/Api";
export interface PeopleObjectMap {
  [key: number]: Person;
}

export type PeopleState = PeopleObjectMap;

const peopleSlice = createSlice({
  name: "people",
  initialState: {} as PeopleState,
  reducers: {
    peopleLoaded: (_state: PeopleState, action: PayloadAction<Person[]>) => {
      const people: PeopleObjectMap = {};
      action.payload.forEach((person) => {
        people[person.id] = person;
      });
      return people;
    },
    personUpdated: (state: PeopleState, action: PayloadAction<Person>) => {
      const person = action.payload;
      state[person.id] = person;
      return state;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { peopleLoaded, personUpdated } = peopleSlice.actions;

// Export the slice reducer as the default export
export default peopleSlice.reducer;
