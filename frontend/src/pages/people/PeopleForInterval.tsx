import { type Interval } from "../../api/Api";
import { useAppSelector } from "../../store";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";
import PeopleByCircle from "./PeopleByCircle";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  const activeCircleId = useAppSelector((state) => state.circles.activeCircleId);

  if (activeCircleId == null) return null;

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
