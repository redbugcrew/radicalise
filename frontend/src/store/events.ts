import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CalendarEvent, CalendarEventAttendance, EventResponseExpectation, Interval } from "../api/Api";
import { endOfDay, startOfDay, toDate } from "date-fns";

export type EventsState = CalendarEvent[];

export function occurInInterval(events: CalendarEvent[], interval: Interval): CalendarEvent[] {
  const intervalStart = startOfDay(interval.start_date);
  const intervalEnd = endOfDay(interval.end_date);

  return events.filter((event) => {
    const eventStart = toDate(event.start_at);
    const eventEnd = event.end_at ? toDate(event.end_at) : eventStart;
    return eventStart < intervalEnd && eventEnd > intervalStart;
  });
}

export function withResponseExpection(events: CalendarEvent[], expections: EventResponseExpectation[]): CalendarEvent[] {
  return events.filter((event) => expections.includes(event.response_expectation));
}

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
        event.attendances ||= [];
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
