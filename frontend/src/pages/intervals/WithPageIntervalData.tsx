import { type Interval } from "../../api/Api"
import { useAppSelector } from "../../store"
import { useLocation } from "react-router-dom"
import { useCurrentInterval, type CurrentIntervalState } from "../../store/current_interval"
import WithIntervalData from "./WithIntervalData"

interface WithIntervalDataChildProps {
  interval: Interval
  intervalData: CurrentIntervalState
  key: string
  isCurrentInterval: boolean
}

interface WithPageIntervalDataProps {
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

export default function WithPageIntervalData({ children }: WithPageIntervalDataProps) {
  const selectedInterval = useSelectedInterval()

  return <WithIntervalData interval={selectedInterval}>{children}</WithIntervalData>
}
