import type { Interval } from "../../../api/Api"
import { default as CrewsList } from "../components/CrewsList"
import { useAppSelector } from "../../../store"
import WithIntervalData from "../../../pages/intervals/WithIntervalData"

interface CrewsForIntervalProps {
  interval: Interval
}

export default function CrewsForInterval({ interval }: CrewsForIntervalProps) {
  const crewsMap = useAppSelector((state) => state.crews)
  const crews = Object.values(crewsMap)
  const people = useAppSelector((state) => state.people)

  return (
    <WithIntervalData interval={interval}>
      {({ intervalData, key }) => {
        return <CrewsList crews={crews} involvements={intervalData?.crew_involvements || []} people={people} key={key} />
      }}
    </WithIntervalData>
  )
}
