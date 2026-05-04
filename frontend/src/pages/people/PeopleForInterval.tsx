import { type Interval } from "../../api/Api";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";
import PeopleByCircle from "./PeopleByCircle";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  return (
    <WithIntervalInvolvements interval={interval}>
      {({ involvements, key, isCurrentInterval }) =>
        involvements && (
          <PeopleByCircle involvementByCircle={involvements.circles} crewInvolvements={involvements.crew_involvements || []} key={key} tableKey={key} intervalId={isCurrentInterval ? undefined : interval?.id} />
        )
      }
    </WithIntervalInvolvements>
  );
}
