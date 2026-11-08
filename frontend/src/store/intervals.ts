import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Interval } from "../api/Api"
import { useAppSelector } from "./index"

export type IntervalsState = Interval[]

export function intervalByNumber(state: IntervalsState, number: number): Interval | null {
  return state.find((interval) => interval.number === number) || null
}

export function findPreviousInterval(intervals: Interval[], currentIntervalNumber: number): Interval | null {
  const currentIndex = intervals.findIndex((i) => i.number === currentIntervalNumber)
  if (currentIndex <= 0) return null
  return intervals[currentIndex - 1]
}

const intervalsSlice = createSlice({
  name: "intervals",
  initialState: [] as IntervalsState,
  reducers: {
    intervalsLoaded: (_state: IntervalsState, action: PayloadAction<IntervalsState>) => action.payload,
    intervalCreated: (state, action: PayloadAction<Interval>) => {
      const withoutNew = state.filter((interval) => interval.number !== action.payload.number)
      const newInterval = action.payload

      return withoutNew.concat(newInterval)
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { intervalsLoaded, intervalCreated } = intervalsSlice.actions

// Export the slice reducer as the default export
export default intervalsSlice.reducer

export function useNextInterval(): Interval | null {
  const allIntervals = useAppSelector((state) => state.intervals)
  const currentInterval = useAppSelector((state) => state.currentInterval?.interval)

  if (!currentInterval) {
    return allIntervals.length === 0 ? null : allIntervals[0]
  }

  const currentIntervalIndex = allIntervals.findIndex((i) => i.number === currentInterval.number)
  if (currentIntervalIndex === -1 || currentIntervalIndex === allIntervals.length - 1) {
    return null // No next interval if current is the last one or not found
  }

  return allIntervals[currentIntervalIndex + 1]
}

export function useFutureIntervals(includeCurrent = false): Interval[] {
  const allIntervals = useAppSelector((state) => state.intervals)
  const currentInterval = useAppSelector((state) => state.currentInterval?.interval)

  if (!currentInterval) {
    return allIntervals
  }

  return allIntervals.filter((interval) =>
    includeCurrent ? interval.number >= currentInterval.number : interval.number > currentInterval.number,
  )
}
