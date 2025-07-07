import { ActionIcon, Container, Group, Title } from "@mantine/core";
import { useAppSelector } from "../store";
import { Anchor } from "../components";
import { IconUserEdit } from "@tabler/icons-react";
import { useParams } from "react-router-dom";

export default function Person() {
  const { personId } = useParams<"personId">();
  const personIdNum = personId ? parseInt(personId, 10) : undefined;
  const meId = useAppSelector((state) => state.me?.person_id);
  const person = useAppSelector((state) => state.people[personIdNum || -1]);
  const canEdit = meId === person.id;

  return (
    <Container>
      <Group justify="space-between">
        <Title order={1}>{person.display_name}</Title>
        {canEdit && (
          <Anchor href="new">
            <ActionIcon variant="filled" aria-label="Add Person" size="lg">
              <IconUserEdit style={{ width: "70%", height: "70%" }} stroke={2} />
            </ActionIcon>
          </Anchor>
        )}
      </Group>
    </Container>
  );
}
