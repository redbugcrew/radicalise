import { createSlice } from "@reduxjs/toolkit";
import type { IntervalInvolvementData, CrewInvolvement, Person, CircleInvolvementData } from "../api/Api";
import type { PeopleObjectMap } from "./people";
import { compareStrings } from "../utilities/comparison";

export interface CircleInvolvementDataMap {
  [key: number]: CircleInvolvementData;
}

export interface IntervalInvolvementState {
  interval_id: number;
  circles: CircleInvolvementDataMap;
  crew_involvements: CrewInvolvement[];
}

export interface InvolvementsState {
  current_interval?: null | IntervalInvolvementState;
  next_interval?: null | IntervalInvolvementState;
}

export function mapCirclesData(data: IntervalInvolvementData): IntervalInvolvementState {
  const circleInvolvementsByCircle: CircleInvolvementDataMap = {};
  data.involvements_for_circles.forEach((circleData) => {
    circleInvolvementsByCircle[circleData.circle_id] = circleData;
  });

  return {
    interval_id: data.interval_id,
    circles: circleInvolvementsByCircle,
    crew_involvements: data.crew_involvements,
  };
}

export function intervalKeyForId(state: InvolvementsState, intervalId: number): keyof InvolvementsState | null {
  if (state.current_interval?.interval_id === intervalId) return "current_interval";
  if (state.next_interval?.interval_id === intervalId) return "next_interval";
  return null;
}

export function currentCircleStateOrDefault(state: InvolvementsState, circleId: number): CircleInvolvementData | null {
  const intervalState = state.current_interval;
  if (!intervalState) return null;

  const result = intervalState?.circles[circleId] || null;
  if (result) return result;

  return {
    circle_id: circleId,
    circle_involvements: [],
    interval_id: intervalState.interval_id,
  };
}

export function forPerson<T extends { person_id: number }>(involvements: T[], personId: number | undefined): T[] {
  if (personId === undefined) return [];
  return involvements.filter((involvement) => involvement.person_id === personId);
}

export function oneForPerson<T extends { person_id: number }>(involvements: T[], personId: number | undefined): T | undefined {
  if (personId === undefined) return undefined;
  return involvements.find((involvement) => involvement.person_id === personId);
}

export function notForPerson<T extends { person_id: number }>(involvements: T[], personId: number): T[] {
  return involvements.filter((involvement) => involvement.person_id !== personId);
}

export function asPeopleAlphaSorted<T extends { person_id: number }>(involvements: T[], people: PeopleObjectMap): Person[] {
  return involvements
    .map((involvement) => people[involvement.person_id])
    .filter(Boolean)
    .sort(compareStrings("display_name"));
}

const involvementsSlice = createSlice({
  name: "involvements",
  initialState: {
    current_interval: null,
    next_interval: null,
  } as InvolvementsState,
  reducers: {},
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {} = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
