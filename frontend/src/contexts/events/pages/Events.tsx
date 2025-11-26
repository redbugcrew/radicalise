import { Stack, Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Anchor } from "../../../components";
import EventsList from "../components/EventsList";
import { useAppSelector } from "../../../store";

export default function Events() {
  const events = useAppSelector((state) => state.events);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Events</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Event Template" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <EventsList events={events} />
    </Stack>
  );
}
