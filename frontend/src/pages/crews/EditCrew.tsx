import { Container, Title } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../store";
import { CrewForm } from "../../components";
import type { Crew } from "../../api/Api";

export default function EditCrew() {
  const { crewId } = useParams<"crewId">();
  const crewIdNum = crewId ? parseInt(crewId, 10) : undefined;

  const crew = useAppSelector((state) => state.crews[crewIdNum || -1]);

  if (!crew) return <Container>Error: Crew not found</Container>;

  const onSubmit = (values: Crew) => {
    // getApi().updateCrew(crew.id, values);
    console.log("Updated Crew:", values);
  };

  return (
    <Container>
      <Title order={1}>Edit Crew</Title>
      <Title order={2} size="h4" mb="lg">
        {crew.name}
      </Title>
      <CrewForm crew={crew} onSubmit={onSubmit} />
    </Container>
  );
}
