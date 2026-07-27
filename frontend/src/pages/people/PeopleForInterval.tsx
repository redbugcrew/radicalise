import { type Interval } from "../../api/Api";
import { mapCirclesInvolvements } from "../../store/current_interval/circle_involvements";
import WithIntervalData from "../intervals/WithIntervalData";
import PeopleByCircle from "./PeopleByCircle";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  return (
    <WithIntervalData interval={interval}>
      {({ intervalData, key, isCurrentInterval }) =>
        intervalData && (
          <PeopleByCircle
            involvementByCircle={mapCirclesInvolvements(intervalData.circle_involvements)}
            crewInvolvements={intervalData.crew_involvements || []}
            key={key}
            tableKey={key}
            intervalId={isCurrentInterval ? undefined : interval?.id}
          />
        )
      }
    </WithIntervalData>
  );
}
