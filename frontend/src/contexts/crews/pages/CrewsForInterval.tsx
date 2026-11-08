import type { Interval } from "../../../api/Api"
import { default as CrewsList } from "../components/CrewsList"
import { useAppSelector } from "../../../store"
import WithIntervalData from "../../../pages/intervals/WithIntervalData"
import { availableCrews } from "../../../store/crews"

interface CrewsForIntervalProps {
  interval: Interval
}

export default function CrewsForInterval({ interval }: CrewsForIntervalProps) {
  const allCrews = useAppSelector((state) => state.crews)
  const people = useAppSelector((state) => state.people)

  return (
    <WithIntervalData interval={interval}>
      {({ intervalData, key }) => {
        return (
          <CrewsList
            crews={availableCrews(allCrews, intervalData)}
            involvements={intervalData?.crew_involvements || []}
            people={people}
            key={key}
          />
        )
      }}
    </WithIntervalData>
  )
}
