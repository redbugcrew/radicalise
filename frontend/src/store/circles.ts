import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Circle } from "../api/Api";

export interface CirclesState {
  activeCircleId: number | null;
  rootCircles: Circle[];
}

const circlesSlice = createSlice({
  name: "circles",
  initialState: {
    activeCircleId: null,
    rootCircles: [],
  } as CirclesState,
  reducers: {
    circlesLoaded: (state: CirclesState, action: PayloadAction<Circle[]>) => {
      const circles = action.payload;
      let result = {
        ...state,
        rootCircles: circles,
      };
      if (result.activeCircleId === null && circles.length > 0) result.activeCircleId = circles[0].id;

      return result;
    },
    circleUpdated: (state: CirclesState, action: PayloadAction<Circle>) => {
      const circle = action.payload;
      const circles = upsertCircleInList(state.rootCircles, circle);

      let result = {
        ...state,
        rootCircles: circles,
      };
      if (result.activeCircleId === null) result.activeCircleId = circle.id;
      return result;
    },
    setActiveCircle: (state: CirclesState, action: PayloadAction<number>) => {
      const newActiveCircleId = action.payload;

      if (!state.rootCircles.some((c) => c.id === newActiveCircleId)) {
        console.warn(`Attempted to set active circle to ${newActiveCircleId}, but it was not found in rootCircles`);
        return state;
      }

      return {
        ...state,
        activeCircleId: newActiveCircleId,
      };
    },
  },
});

export function getActiveCircle(state: CirclesState): Circle | null {
  return state.rootCircles?.find((c) => c.id === state.activeCircleId) || null;
}

function upsertCircleInList(circles: Circle[], circle: Circle): Circle[] {
  const index = circles.findIndex((c) => c.id === circle.id);

  if (index !== -1) {
    const result = [...circles];
    result[index] = circle;
    return result;
  } else {
    // Circle not found, add it to the list
    return [...circles, circle];
  }
}

export const { circlesLoaded, circleUpdated, setActiveCircle } = circlesSlice.actions;

// Export the slice reducer as the default export
export default circlesSlice.reducer;
