import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CircleInvolvement, IntervalInvolvementData, CrewInvolvement, Person, PersonIntervalCircleInvolvementData, CircleInvolvementData, InvolvementData } from "../api/Api";
import { type WritableDraft } from "immer";
import type { PeopleObjectMap } from "./people";
import { compareStrings } from "../utilities/comparison";

export interface CircleInvolvementDataMap {
  [key: number]: CircleInvolvementData;
}

export interface IntervalInvolvementState {
  interval_id: number;
  circles: CircleInvolvementDataMap;
}

export interface InvolvementsState {
  current_interval?: null | IntervalInvolvementState;
  next_interval?: null | IntervalInvolvementState;
}

function upsertInvolvementsForPerson(state: CircleInvolvementData, personId: number, newInvolvement: CircleInvolvement, crew_involvements: CrewInvolvement[]): CircleInvolvementData {
  const existingCircleInvolvements = state.circle_involvements || [];
  const newCircleInvolvements = existingCircleInvolvements.filter((involvement) => involvement.id !== newInvolvement.id).concat(newInvolvement);

  const existingCrewInvolvements = state.crew_involvements || [];
  const newCrewInvolvements = updateCrewInvolvementForPerson(existingCrewInvolvements, crew_involvements, personId);

  return {
    ...state,
    circle_involvements: newCircleInvolvements,
    crew_involvements: newCrewInvolvements,
  };
}

export function getMatchingInvolvementInterval(involvements: InvolvementsState, intervalId: number): IntervalInvolvementState | null {
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

export function mapCirclesData(data: IntervalInvolvementData): IntervalInvolvementState {
  const circleInvolvementsByCircle: CircleInvolvementDataMap = {};
  data.involvements_for_circles.forEach((circleData) => {
    circleInvolvementsByCircle[circleData.circle_id] = circleData;
  });
  return {
    interval_id: data.interval_id,
    circles: circleInvolvementsByCircle,
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
    intervalDataChanged: (state: InvolvementsState, action: PayloadAction<PersonIntervalCircleInvolvementData>) => {
      let payload = action.payload;

      if (!state || !payload) return state;

      const involvement = payload.project_involvement;
      if (!involvement) return state;
      const person_id = involvement.person_id;

      const interval_keys: (keyof InvolvementsState)[] = ["current_interval", "next_interval"];

      interval_keys.forEach((interval_key) => {
        if (state && state[interval_key] && state[interval_key].interval_id === payload.interval_id) {
          const intervalState: IntervalInvolvementState = state[interval_key];
          const circleId = payload.circle_id;

          intervalState.circles[circleId] = upsertInvolvementsForPerson(intervalState.circles[circleId], person_id, involvement, payload.crew_involvements);
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
