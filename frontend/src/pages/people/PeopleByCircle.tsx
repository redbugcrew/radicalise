import type { CrewInvolvement } from "../../api/Api";
import type { CircleInvolvementDataMap } from "../../store/involvements";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";

interface PeopleByCircleProps {
  circles: CircleInvolvementDataMap;
  crewInvolvements: CrewInvolvement[];
  tableKey?: React.Key;
  intervalId?: number | null;
}

export default function PeopleByCircle({ circles, crewInvolvements, tableKey, intervalId }: PeopleByCircleProps) {
  const circleId = parseInt(Object.keys(circles)[0]);

  const circleInvolvements = circles[circleId]?.circle_involvements || [];

  return <PeopleByInvolvementStatus involvements={circleInvolvements} crewInvolvements={crewInvolvements} key={tableKey} tableKey={tableKey} intervalId={intervalId} />;
}
