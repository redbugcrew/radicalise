import { ActionIcon, Group, Stack, Title } from "@mantine/core";
import { Anchor } from "../../../components";
import { IconPlus } from "@tabler/icons-react";

export default function Circles() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Circles</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Circle" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
    </Stack>
  );
}
