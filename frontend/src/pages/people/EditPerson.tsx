import { Container, Title } from "@mantine/core";
import { handleAppEvents, useAppSelector } from "../../store";
import { useNavigate, useParams } from "react-router-dom";
import { PersonForm } from "../../components";
import { getApi } from "../../api";
import type { Person } from "../../api/Api";

export default function EditPerson() {
  const { personId } = useParams<"personId">();
  const personIdNum = personId ? parseInt(personId, 10) : undefined;
  const person = useAppSelector((state) => state.people[personIdNum || -1]);
  const navigate = useNavigate();

  const onSubmit = (values: Person) => {
    getApi()
      .api.updatePerson(values.id.toString(), values)
      .then((response) => {
        if (response.status === 200) {
          handleAppEvents(response.data);
          navigate(`/people/${values.id}`);
        } else {
          console.error("Failed to update person:", response);
        }
      })
      .catch((error) => {
        console.error("Error updating person:", error);
      });
  };

  return (
    <Container>
      <Title order={1}>Edit Person</Title>
      <Title order={2} size="h4" mb="lg">
        {person.display_name}
      </Title>
      <PersonForm person={person} onSubmit={onSubmit} />
    </Container>
  );
}
