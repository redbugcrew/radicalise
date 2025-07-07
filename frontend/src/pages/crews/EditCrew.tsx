import { Container, Title } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { handleAppEvents, useAppSelector } from "../../store";
import { CrewForm } from "../../components";
import type { Crew } from "../../api/Api";
import { getApi } from "../../api";

export default function EditCrew() {
  const { crewId } = useParams<"crewId">();
  const crewIdNum = crewId ? parseInt(crewId, 10) : undefined;

  const navigate = useNavigate();

  const crew = useAppSelector((state) => state.crews[crewIdNum || -1]);

  if (!crew) return <Container>Error: Crew not found</Container>;

  const onSubmit = (values: Crew) => {
    getApi()
      .api.updateCrew(values.id.toString(), values)
      .then((response) => {
        if (response.status === 200) {
          handleAppEvents(response.data);
          navigate("/crews");
        } else {
          console.error("Failed to update crew:", response);
        }
      })
      .catch((error) => {
        console.error("Error updating crew:", error);
      });
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
