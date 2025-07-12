import { Container, Title } from "@mantine/core";
import { useAppSelector } from "../../store";
import { useParams } from "react-router-dom";
import { PersonForm } from "../../components";

export default function EditPerson() {
  const { personId } = useParams<"personId">();
  const personIdNum = personId ? parseInt(personId, 10) : undefined;
  const person = useAppSelector((state) => state.people[personIdNum || -1]);

  const onSubmit = (values: any) => {
    // Placeholder for submit logic
    console.log("Submitted values:", values);
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
