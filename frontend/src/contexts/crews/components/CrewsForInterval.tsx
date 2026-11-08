import type { Interval } from "../../../api/Api"
import { default as CrewsByStatus } from "../components/CrewsByStatus"
import { useAppSelector } from "../../../store"
import WithIntervalData from "../../../pages/intervals/WithIntervalData"
import { appendCrewStatus } from "../../../store/crews"

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
          <CrewsByStatus
            crews={appendCrewStatus(allCrews, intervalData)}
            involvements={intervalData?.crew_involvements || []}
            people={people}
            key={key}
          />
        )
      }}
    </WithIntervalData>
  )
}
