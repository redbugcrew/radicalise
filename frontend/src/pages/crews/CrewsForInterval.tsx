import type { Interval } from "../../api/Api";
import { CrewsList } from "../../components";
import { useAppSelector } from "../../store";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";

interface CrewsForIntervalProps {
  interval: Interval;
}

export default function CrewsForInterval({ interval }: CrewsForIntervalProps) {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap);
  const people = useAppSelector((state) => state.people);

  return (
    <WithIntervalInvolvements interval={interval}>
      {({ involvements, key }) => {
        return <CrewsList crews={crews} involvements={involvements?.crew_involvements || []} people={people} key={key} />;
      }}
    </WithIntervalInvolvements>
  );
}
