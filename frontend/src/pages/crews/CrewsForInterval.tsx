import type { Interval } from "../../api/Api";
import { CrewsList } from "../../components";
import { useAppSelector } from "../../store";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";

interface CrewsForIntervalProps {
  interval: Interval;
  circleId: number;
}

export default function CrewsForInterval({ interval, circleId }: CrewsForIntervalProps) {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap);
  const people = useAppSelector((state) => state.people);

  return (
    <WithIntervalInvolvements interval={interval} circleId={circleId}>
      {({ involvements, key }) => {
        return <CrewsList crews={crews} involvements={involvements?.crew_involvements || []} people={people} key={key} />;
      }}
    </WithIntervalInvolvements>
  );
}
