import { Stack, Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Anchor } from "../../../components";

export default function EventTemplates() {
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
      <div>Event Templates list here</div>
    </Stack>
  );
}
