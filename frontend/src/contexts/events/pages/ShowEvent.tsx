import { ActionIcon, Group, Stack, Title, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../store";
import MyAttendance from "../components/MyAttendance";
import { Anchor, LinksStack } from "../../../components";
import { IconEdit } from "@tabler/icons-react";
import EventAttendeeTable from "../components/EventAttendeeTable";
import { isPast } from "date-fns";

export default function ShowEvent() {
  const { eventId } = useParams<"eventId">();
  const eventIdNum = eventId ? parseInt(eventId, 10) : undefined;

  if (eventIdNum === undefined) return <div>Invalid Event ID</div>;

  const event = useAppSelector((state) => state.events.find((e) => e.id === eventIdNum));
  if (!event) return <div>Event not found</div>;

  const eventTemplate = useAppSelector((state) => (event.event_template_id ? state.eventTemplates.find((et) => et.id === event.event_template_id) : null));

  const inPast = event.end_at ? isPast(event.end_at) : isPast(event.start_at);

  return (
    <Stack>
      <Group justify="space-between">
        <Stack gap={0}>
          <Title order={1}>{event.name}</Title>
          {eventTemplate && <Text c="dimmed">{[eventTemplate.name, eventTemplate.summary].filter(Boolean).join(": ")}</Text>}
        </Stack>

        <Anchor href="edit">
          <ActionIcon variant="filled" aria-label="Edit Event" size="lg">
            <IconEdit style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>

      <Stack gap="lg">
        <Stack gap="md" align="flex-start">
          <Title order={2}>Me</Title>
          <MyAttendance event={event} readonly={inPast} />
        </Stack>

        <Stack gap="md" align="stretch">
          <Title order={2}>Attendees</Title>
          <EventAttendeeTable event={event} />{" "}
        </Stack>

        {(event.links || []).length > 0 && (
          <Stack gap="md" align="stretch">
            <Title order={2}>Event Details</Title>
            <LinksStack links={event.links} />
          </Stack>
        )}

        {eventTemplate && (eventTemplate?.links || []).length > 0 && (
          <Stack gap="md" align="stretch">
            <Title order={2}>Event Template: {eventTemplate.name}</Title>
            <LinksStack links={eventTemplate.links} />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
