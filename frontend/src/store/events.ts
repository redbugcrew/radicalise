import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CalendarEvent } from "../api/Api";

export type EventsState = CalendarEvent[];

const eventsSlice = createSlice({
  name: "events",
  initialState: [] as EventsState,
  reducers: {
    eventsLoaded: (_state: EventsState, action: PayloadAction<CalendarEvent[]>) => {
      return action.payload;
    },
    eventUpdated: (state: EventsState, action: PayloadAction<CalendarEvent>) => {
      const index = state.findIndex((event) => event.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      } else {
        state.push(action.payload);
      }
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { eventsLoaded, eventUpdated } = eventsSlice.actions;

// Export the slice reducer as the default export
export default eventsSlice.reducer;
