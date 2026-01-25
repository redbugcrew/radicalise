import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CalendarEvent, CalendarEventAttendance } from "../api/Api";

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
    singleAttendanceUpdate: (state: EventsState, action: PayloadAction<CalendarEventAttendance>) => {
      const eventIndex = state.findIndex((event) => event.id === action.payload.calendar_event_id);

      if (eventIndex === -1) {
        console.warn("Updating attendance for event that doesn't exist:", action.payload.calendar_event_id);
      } else {
        const event = state[eventIndex];
        event.attendances = [];
        const attendanceIndex = event.attendances.findIndex((attendance) => attendance.id === action.payload.id);

        if (attendanceIndex === -1) {
          event.attendances.push(action.payload);
        } else {
          event.attendances[attendanceIndex] = action.payload;
        }
      }
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { eventsLoaded, eventUpdated, singleAttendanceUpdate } = eventsSlice.actions;

// Export the slice reducer as the default export
export default eventsSlice.reducer;
