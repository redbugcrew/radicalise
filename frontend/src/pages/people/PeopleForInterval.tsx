import { type Interval } from "../../api/Api";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  return (
    <WithIntervalInvolvements interval={interval}>
      {({ involvements, key, isCurrentInterval }) =>
        involvements && (
          <PeopleByInvolvementStatus involvements={involvements.project_involvements} crewEnrolments={involvements.crew_involvements} key={key} tableKey={key} intervalId={isCurrentInterval ? undefined : interval?.id} />
        )
      }
    </WithIntervalInvolvements>
  );
}
