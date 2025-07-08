import { Container, Title } from "@mantine/core";
import { handleAppEvents, useAppSelector } from "../store";
import { CollectiveForm } from "../components";
import type { Collective } from "../api/Api";
import { getApi } from "../api";
import { useNavigate } from "react-router-dom";

export default function EditCollective() {
  const collective = useAppSelector((state) => state.collective);
  const navigate = useNavigate();

  if (!collective) return <Container>Error: Collective not found</Container>;

  const onSubmit = (values: Collective) => {
    getApi()
      .api.updateCollective(values)
      .then((response) => {
        if (response.status === 200) {
          handleAppEvents(response.data);
          navigate("/");
        } else {
          console.error("Failed to update collective:", response);
        }
      })
      .catch((error) => {
        console.error("Error updating collective:", error);
      });
  };

  return (
    <Container>
      <Title order={1}>Edit Collective</Title>
      <Title order={2} size="h4" mb="lg">
        {collective.name}
      </Title>
      <CollectiveForm collective={collective} onSubmit={onSubmit} />
    </Container>
  );
}
