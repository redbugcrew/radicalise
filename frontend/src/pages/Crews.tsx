import { Stack, Title } from "@mantine/core";
import { CrewsTable } from "../components";
import { useAppSelector } from "../store";

export default function Crews() {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap);
  const involvements = useAppSelector((state) => state.involvements.current_interval?.crew_involvements || []);
  const people = useAppSelector((state) => state.people);

  return (
    <Stack>
      <Title order={1}>Crews</Title>
      <CrewsTable crews={crews} involvements={involvements} people={people} />
    </Stack>
  );
}
