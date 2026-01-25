import { Group, Stack, Title } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../store";

export default function ShowEvent() {
  const { eventId } = useParams<"eventId">();
  const eventIdNum = eventId ? parseInt(eventId, 10) : undefined;

  if (eventIdNum === undefined) return <div>Invalid Event ID</div>;

  const event = useAppSelector((state) => state.events.find((e) => e.id === eventIdNum));
  if (!event) return <div>Event not found</div>;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>{event.name}</Title>

        {/* <Anchor href="edit">
          <ActionIcon variant="filled" aria-label="Edit Event" size="lg">
            <IconEdit style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor> */}
      </Group>

      <div>Event details go here</div>
    </Stack>
  );
}
