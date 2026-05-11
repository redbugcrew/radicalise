import { Stack, Text } from "@mantine/core";
import type { CrewInvolvement } from "../../api/Api";
import { useAppSelector } from "../../store";
import type { CircleInvolvementDataMap } from "../../store/involvements";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";
import { CircleSelector } from "../../components";
import { useNavigate, useLocation } from "react-router-dom";

interface PeopleByCircleProps {
  involvementByCircle: CircleInvolvementDataMap;
  crewInvolvements: CrewInvolvement[];
  tableKey?: React.Key;
  intervalId?: number | null;
}

export default function PeopleByCircle({ involvementByCircle, crewInvolvements, tableKey, intervalId }: PeopleByCircleProps) {
  const circles = useAppSelector((state) => state.circles.rootCircles);
  const navigate = useNavigate();
  const { hash, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const circleSlug = searchParams.get("circle");

  const defaultCircleId = circles[0]?.id ?? null;
  const circleId = circleSlug ? (circles.find((c) => c.slug === circleSlug)?.id ?? null) : defaultCircleId;

  if (!circleId) {
    return (
      <Stack>
        <Text>There is no circle called "{circleSlug}"</Text>
      </Stack>
    );
  }

  const circleInvolvements = involvementByCircle[circleId]?.circle_involvements || [];

  const onChangeCircle = (newCircleId: number) => {
    const circle = circles.find((c) => c.id === newCircleId);
    if (circle) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("circle", circle.slug);
      navigate({ search: newParams.toString(), hash });
    } else {
      console.warn(`Circle with id ${newCircleId} not found`);
    }
  };

  const newKey = `${tableKey}-${circleId}`;
  const canSelectCircle = circles.length > 1;

  return (
    <Stack gap="lg">
      {canSelectCircle && <CircleSelector circles={circles} selectedCircleId={circleId} onChange={onChangeCircle} />}
      <PeopleByInvolvementStatus involvements={circleInvolvements} crewInvolvements={crewInvolvements} key={newKey} tableKey={newKey} intervalId={intervalId} />
    </Stack>
  );
}
