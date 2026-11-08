import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { CircleInvolvement, CrewState, Interval, IntervalData, PersonIntervalData } from "../../api/Api"
import { useAppSelector } from ".."
import { forCircle, updatePersonCircleInvolvements, upsertCircleData, upsertCircleInvolvement } from "./circle_involvements"
import { updatePersonCrewInvolvements } from "./crew_involvements"

export type CurrentIntervalState = IntervalData | null

const currentIntervalSlice = createSlice({
  name: "current_interval",
  initialState: null as CurrentIntervalState,
  reducers: {
    currentIntervalLoaded: (_state: CurrentIntervalState, action: PayloadAction<IntervalData | null>) => {
      return action.payload
    },
    circleInvolvementUpdated: (state: CurrentIntervalState, action: PayloadAction<CircleInvolvement>) => {
      const involvement = action.payload
      if (!state || !involvement) return state

      if (state.interval.number !== involvement.interval_number) return state

      const circleData = forCircle(state.circle_involvements, involvement.circle_id)
      if (!circleData) return state

      const newCircleData = upsertCircleInvolvement(circleData, involvement)
      const newCircleInvolvements = upsertCircleData(state.circle_involvements, newCircleData)

      return {
        ...state,
        circle_involvements: newCircleInvolvements,
      }
    },
    personIntervalDataChanged: (state: CurrentIntervalState, action: PayloadAction<PersonIntervalData>) => {
      const payload = action.payload
      if (!state || !payload) return state

      const person_id = payload.person_id

      if (state.interval.number !== payload.data.interval.number) return state

      return {
        ...state,
        circle_involvements: updatePersonCircleInvolvements(state.circle_involvements, payload.data.circle_involvements, person_id),
        crew_involvements: updatePersonCrewInvolvements(state.crew_involvements, payload.data.crew_involvements, person_id),
      }
    },
    crewStateUpdated: (state: CurrentIntervalState, action: PayloadAction<CrewState>) => {
      const crewState = action.payload
      const interval = state?.interval
      if (!interval) return state

      if (interval.number !== crewState.interval_number || interval.project_id !== crewState.project_id) return state

      return {
        ...state,
        crew_states: upsertCrewState(state.crew_states, crewState),
      }
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { currentIntervalLoaded, circleInvolvementUpdated, personIntervalDataChanged, crewStateUpdated } = currentIntervalSlice.actions

// Export the slice reducer as the default export
export default currentIntervalSlice.reducer

export function useCurrentInterval(): Interval | null {
  const currentInterval = useAppSelector((state) => state.currentInterval?.interval)
  return currentInterval ?? null
}

function upsertCrewState(crewStates: CrewState[], newCrewState: CrewState): CrewState[] {
  const index = crewStates.findIndex(
    (cs) =>
      cs.crew_id === newCrewState.crew_id &&
      cs.interval_number === newCrewState.interval_number &&
      cs.project_id === newCrewState.project_id,
  )
  if (index === -1) {
    return [...crewStates, newCrewState]
  } else {
    const updatedCrewStates = [...crewStates]
    updatedCrewStates[index] = newCrewState
    return updatedCrewStates
  }
}
