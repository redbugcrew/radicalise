import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EventTemplate } from "../api/Api";

export type EventTemplatesState = EventTemplate[];

const eventTemplatesSlice = createSlice({
  name: "eventTemplates",
  initialState: [] as EventTemplatesState,
  reducers: {
    eventTemplatesLoaded: (_state: EventTemplatesState, action: PayloadAction<EventTemplate[]>) => {
      return action.payload;
    },
    eventTemplateUpdated: (state: EventTemplatesState, action: PayloadAction<EventTemplate>) => {
      const index = state.findIndex((eventTemplate) => eventTemplate.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { eventTemplatesLoaded, eventTemplateUpdated } = eventTemplatesSlice.actions;

// Export the slice reducer as the default export
export default eventTemplatesSlice.reducer;
