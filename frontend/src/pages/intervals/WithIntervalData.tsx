import { useEffect, useState } from "react"
import { type Interval } from "../../api/Api"
import { useAppSelector } from "../../store"
import { getApi } from "../../api"
import { useLocation } from "react-router-dom"
import { useCurrentInterval, type CurrentIntervalState } from "../../store/current_interval"

interface WithIntervalDataChildProps {
  interval: Interval
  intervalData: CurrentIntervalState
  key: string
  isCurrentInterval: boolean
}

interface WithIntervalDataProps {
  interval: Interval | null | undefined
  children: (props: WithIntervalDataChildProps) => React.ReactNode
}

const useHashIntervalNumber = (): number | null => {
  const location = useLocation()
  const hash = location.hash
  if (hash.startsWith("#interval")) {
    const numberStr = hash.replace("#interval", "")
    const number = parseInt(numberStr, 10)
    if (!isNaN(number)) {
      return number
    }
  }
  return null
}

export const useSelectedInterval = (): Interval | null => {
  const pathIntervalNumber = useHashIntervalNumber()
  const currentInterval = useCurrentInterval()
  const allIntervals = useAppSelector((state) => state.intervals)
  const selectedInterval: Interval | null =
    pathIntervalNumber == null ? currentInterval : allIntervals.find((i) => i.number === pathIntervalNumber) || null
  return selectedInterval
}

export default function WithIntervalData({ interval, children }: WithIntervalDataProps) {
  const currentIntervalData = useAppSelector((state) => state.currentInterval)
  const currentProjectId = useAppSelector((state) => state.project?.id)

  const [cacheKey, setCacheKey] = useState<number>(0)

  const [intervalData, setIntervalData] = useState<CurrentIntervalState | null>(null)

  const incrementCacheKey = () => {
    setCacheKey((prevKey) => prevKey + 1)
  }

  const tableKey = interval ? `${interval.number}-${cacheKey}` : "no-interval"

  useEffect(() => {
    if (!interval || !currentProjectId) {
      setIntervalData(null)
      return
    }

    if (currentIntervalData?.interval.number === interval.number) {
      setIntervalData(currentIntervalData)
    } else {
      console.log("fetching interval involvements from API")
      const api = getApi()

      api.api
        .getIntervalData(interval.number, currentProjectId)
        .then((response) => {
          setIntervalData(response.data)
        })
        .catch((error) => {
          console.error("Error fetching involvements:", error)
          setIntervalData(null)
        })
    }

    incrementCacheKey()
  }, [interval, currentIntervalData, currentProjectId])

  if (!interval) return null

  return children({
    interval: interval,
    intervalData,
    key: tableKey,
    isCurrentInterval: interval.number === currentIntervalData?.interval.number,
  })
}
