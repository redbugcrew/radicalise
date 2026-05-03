import { type Interval } from "../../api/Api";
import { useAppSelector } from "../../store";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  const activeCircleId = useAppSelector((state) => state.circles.activeCircleId);

  if (activeCircleId == null) return null;

  return (
    <WithIntervalInvolvements interval={interval} circleId={activeCircleId}>
      {({ involvements, key, isCurrentInterval }) =>
        involvements && (
          <PeopleByInvolvementStatus involvements={involvements.circle_involvements} crewEnrolments={involvements.crew_involvements} key={key} tableKey={key} intervalId={isCurrentInterval ? undefined : interval?.id} />
        )
      }
    </WithIntervalInvolvements>
  );
}
