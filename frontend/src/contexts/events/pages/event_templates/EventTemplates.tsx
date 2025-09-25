import { Stack, Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Anchor } from "../../../../components";
import { useAppSelector } from "../../../../store";
import EventTemplatesTable from "../../components/event_templates/EventTemplatesTable";

export default function EventTemplates() {
  const eventTemplates = useAppSelector((state) => state.eventTemplates);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Event Templates</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Event Template" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <EventTemplatesTable eventTemplates={eventTemplates} />
    </Stack>
  );
}
