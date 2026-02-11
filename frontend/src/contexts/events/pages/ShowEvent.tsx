import { ActionIcon, Group, Stack, Title, Text, Table } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../store";
import MyAttendance from "../components/MyAttendance";
import { Anchor, LinksStack, Markdown } from "../../../components";
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
      <Group justify="space-between" align="center" wrap="nowrap" gap="md">
        <Title order={1}>{event.name}</Title>

        <Anchor href="edit">
          <ActionIcon variant="filled" aria-label="Edit Event" size="lg">
            <IconEdit style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>

      <Stack gap="lg">
        <Stack gap="md">
          <Title order={2}>Details</Title>
          <Table variant="vertical">
            <Table.Tbody>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Td>
                  <Text fw="bold">{eventTemplate?.name}</Text>
                  <Text>{eventTemplate?.summary}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Summary</Table.Th>
                <Table.Td>
                  <Text>{event?.summary}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Description</Table.Th>
                <Table.Td>
                  <Markdown>{event?.description}</Markdown>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Location</Table.Th>
                <Table.Td>
                  <Text>{event?.location}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Start Time</Table.Th>
                <Table.Td>{new Date(event.start_at).toLocaleString()}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>End Time</Table.Th>
                <Table.Td>{event.end_at ? new Date(event.end_at).toLocaleString() : "N/A"}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>

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
