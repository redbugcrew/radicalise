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

export function getMatchingInvolvementInterval(involvements: InvolvementsState, intervalId: number): IntervalInvolvementState | null {
  if (involvements.current_interval && involvements.current_interval.interval_id === intervalId) {
    return involvements.current_interval;
  }
  if (involvements.next_interval && involvements.next_interval.interval_id === intervalId) {
    return involvements.next_interval;
  }
  return null;
}

export function myCircleInvolvement(state: InvolvementsState, circleId: number, personId: number, key: keyof InvolvementsState): CircleInvolvement | null {
  const intervalState = state[key];
  if (!intervalState) return null;

  const circleState = intervalState.circles[circleId];
  if (!circleState) return null;

  return forPerson(circleState.circle_involvements || [], personId)[0] || null;
}

export function myCircleInvolvements(intervalState: IntervalInvolvementState | null, personId: number): CircleInvolvement[] | null {
  if (!intervalState) return null;

  const involvementsForPerson: CircleInvolvement[] = [];
  Object.values(intervalState.circles).forEach((circleState) => {
    const involvements = forPerson<CircleInvolvement>(circleState.circle_involvements || [], personId);
    involvementsForPerson.push(...involvements);
  });

  return involvementsForPerson;
}

export function myCrewInvolvements(state: InvolvementsState, personId: number, key: keyof InvolvementsState): CrewInvolvement[] | null {
  return forPerson(allCrewInvolvements(state, key) || [], personId);
}

export function allCrewInvolvements(state: InvolvementsState, key: keyof InvolvementsState): CrewInvolvement[] | null {
  const intervalState = state[key];

  if (!intervalState) return null;

  return intervalState.crew_involvements || [];
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

const interval_keys: (keyof InvolvementsState)[] = ["current_interval", "next_interval"];

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
    involvementUpdated: (state: InvolvementsState, action: PayloadAction<CircleInvolvement>) => {
      let involvement = action.payload;
      if (!state || !involvement) return state;

      interval_keys.forEach((interval_key) => {
        if (state[interval_key]?.interval_id === involvement.interval_id) {
          const intervalState: IntervalInvolvementState = state[interval_key];
          const circleId = involvement.circle_id;

          if (!intervalState.circles[circleId]) {
            intervalState.circles[circleId] = {
              circle_id: circleId,
              circle_involvements: [],
              interval_id: intervalState.interval_id,
            };
          }

          intervalState.circles[circleId] = upsertCircleInvolvement(intervalState.circles[circleId], involvement);
        }
      });

      return state;
    },
    intervalDataChanged: (state: InvolvementsState, action: PayloadAction<PersonIntervalInvolvementData>) => {
      let payload = action.payload;
      if (!state || !payload) return state;

      const person_id = payload.person_id;

      interval_keys.forEach((interval_key) => {
        if (state[interval_key]?.interval_id === payload.data.interval_id) {
          const intervalState: IntervalInvolvementState = state[interval_key];

          payload.data.involvements_for_circles.forEach((circleInvolvementData) => {
            const circleId = circleInvolvementData.circle_id;
            const newInvolvement = circleInvolvementData.circle_involvements.find((involvement) => involvement.person_id === person_id);

            if (newInvolvement) intervalState.circles[circleId] = upsertCircleInvolvement(intervalState.circles[circleId], newInvolvement);
          });
          intervalState.crew_involvements = updateCrewInvolvementsForPerson(intervalState.crew_involvements, payload.data.crew_involvements, person_id);
        }
      });

      return state;
    },
  },
});

function upsertCircleInvolvement(state: CircleInvolvementData, newInvolvement: CircleInvolvement): CircleInvolvementData {
  const existingCircleInvolvements = state.circle_involvements || [];
  const newCircleInvolvements = existingCircleInvolvements.filter((involvement) => involvement.id !== newInvolvement.id).concat(newInvolvement);

  return {
    ...state,
    circle_involvements: newCircleInvolvements,
  };
}

function updateCrewInvolvementsForPerson(crewInvolvements: WritableDraft<CrewInvolvement>[], personInvolvements: CrewInvolvement[], personId: number): WritableDraft<CrewInvolvement>[] {
  const withoutPerson = crewInvolvements.filter((involvement) => involvement.person_id !== personId);
  return withoutPerson.concat(personInvolvements);
}

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { involvementsLoaded, involvementUpdated, intervalDataChanged } = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
