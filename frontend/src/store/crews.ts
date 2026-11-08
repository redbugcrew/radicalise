import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { CrewStatus, CrewWithLinks as CrewWithAnyLinks, Link, CrewState } from "../api/Api"
import type { CurrentIntervalState } from "./current_interval"

export type CrewWithLinks = CrewWithAnyLinks & {
  links: Link[] | undefined
}

export interface CrewObjectMap {
  [key: number]: CrewWithLinks
}

export type CrewsState = CrewObjectMap

export function crewsArrayFromObjectMap(crewsMap: CrewObjectMap): CrewWithLinks[] {
  return Object.values(crewsMap)
}

const crewsSlice = createSlice({
  name: "crews",
  initialState: {} as CrewsState,
  reducers: {
    crewsLoaded: (_state: CrewsState, action: PayloadAction<CrewWithAnyLinks[]>) => {
      const crews: CrewObjectMap = {}
      action.payload.forEach((crew) => {
        crews[crew.id] = crew as CrewWithLinks
      })
      return crews
    },
    crewUpdated: (state: CrewsState, action: PayloadAction<CrewWithAnyLinks>) => {
      state[action.payload.id] = action.payload as CrewWithLinks
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { crewsLoaded, crewUpdated } = crewsSlice.actions

// Export the slice reducer as the default export
export default crewsSlice.reducer

export interface CrewWithStatus extends CrewWithLinks {
  status: CrewStatus | undefined
}

export function availableCrews(allCrews: CrewObjectMap, intervalData: CurrentIntervalState): CrewWithStatus[] {
  return appendCrewStatus(allCrews, intervalData).filter((crew) => crew.status === "Available")
}

export function filterCrewsByStatus(crews: CrewWithStatus[], status: CrewStatus): CrewWithStatus[] {
  return crews.filter((crew) => crew.status === status)
}

export function appendCrewStatus(allCrews: CrewObjectMap, intervalData: CurrentIntervalState): CrewWithStatus[] {
  return Object.values(allCrews).map((crew) => {
    const crewState: CrewState | undefined = intervalData?.crew_states.find((state) => state.crew_id === crew.id)
    return {
      ...crew,
      status: crewState?.state,
    }
  })
}
