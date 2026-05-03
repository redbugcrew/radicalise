import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CircleInvolvement, IntervalInvolvementData, CrewInvolvement, Person, PersonIntervalInvolvementData, CircleInvolvementData, InvolvementData } from "../api/Api";
import { type WritableDraft } from "immer";
import type { PeopleObjectMap } from "./people";
import { compareStrings } from "../utilities/comparison";

export interface CircleInvolvementDataMap {
  [key: number]: CircleInvolvementData;
}

export interface IntervalInvolvementState {
  interval_id: number;
  involvements_for_circles: CircleInvolvementDataMap;
}

export interface InvolvementsState {
  current_interval?: null | IntervalInvolvementState;
  next_interval?: null | IntervalInvolvementState;
}

function upsertCircleInvolvement(involvements: CircleInvolvement[], newInvolvement: CircleInvolvement): CircleInvolvement[] {
  const existingIndex = involvements.findIndex((inv) => inv.id === newInvolvement.id);
  if (existingIndex !== -1) {
    // Update existing involvement
    return involvements.map((inv, index) => (index === existingIndex ? newInvolvement : inv));
  } else {
    // Add new involvement
    return [...involvements, newInvolvement];
  }
}

export function getMatchingInvolvementInterval(involvements: InvolvementsState, intervalId: number): IntervalInvolvementData | null {
  if (involvements.current_interval && involvements.current_interval.interval_id === intervalId) {
    return involvements.current_interval;
  }
  if (involvements.next_interval && involvements.next_interval.interval_id === intervalId) {
    return involvements.next_interval;
  }
  return null;
}

export function forCrew(involvements: CrewInvolvement[], crewId: number): CrewInvolvement[] {
  return involvements.filter((involvement) => involvement.crew_id === crewId);
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

function updateCrewInvolvementForPerson(crewInvolvements: WritableDraft<CrewInvolvement>[], personInvolvements: CrewInvolvement[], personId: number): WritableDraft<CrewInvolvement>[] {
  const withoutPerson = crewInvolvements.filter((involvement) => involvement.person_id !== personId);
  return withoutPerson.concat(personInvolvements);
}

function mapCirclesData(data: IntervalInvolvementData): IntervalInvolvementState {
  const circleInvolvementsByCircle: CircleInvolvementDataMap = {};
  data.involvements_for_circles.forEach((circleData) => {
    circleInvolvementsByCircle[circleData.circle_id] = circleData;
  });
  return {
    interval_id: data.interval_id,
    involvements_for_circles: circleInvolvementsByCircle,
  };
}

const involvementsSlice = createSlice({
  name: "involvements",
  initialState: {
    current_interval: null,
    next_interval: null,
  } as InvolvementsState,
  reducers: {
    involvementsLoaded: (_state: InvolvementsState, action: PayloadAction<InvolvementData>) => {
      const current_interval = action.payload.current_interval ? mapCirclesData(action.payload.current_interval) : null;
      const next_interval = action.payload.next_interval ? mapCirclesData(action.payload.next_interval) : null;
      return {
        current_interval,
        next_interval,
      };
    },
    intervalDataChanged: (state: InvolvementsState, action: PayloadAction<PersonIntervalInvolvementData>) => {
      let payload = action.payload;

      if (!state || !payload) return state;

      const involvement = payload.project_involvement;
      if (!involvement) return state;
      const person_id = involvement.person_id;

      const interval_keys: (keyof InvolvementsState)[] = ["current_interval", "next_interval"];

      interval_keys.forEach((key) => {
        if (state && state[key] && state[key].interval_id === payload.interval_id) {
          state[key].circle_involvements = upsertCircleInvolvement(state[key].circle_involvements, involvement);
          state[key].crew_involvements = updateCrewInvolvementForPerson(state[key].crew_involvements, forPerson(payload.crew_involvements, person_id), person_id);
        }
      });

      return state;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { involvementsLoaded, intervalDataChanged } = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
