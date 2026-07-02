import { Stack, Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Anchor } from "@mantine/core";

export default function EventTemplates() {
  const PeerRoleTemplatesTable = [
    { position: 6, mass: 12.011, symbol: "C", name: "Carbon" },
    { position: 7, mass: 14.007, symbol: "N", name: "Nitrogen" },
    { position: 39, mass: 88.906, symbol: "Y", name: "Yttrium" },
    { position: 56, mass: 137.33, symbol: "Ba", name: "Barium" },
    { position: 58, mass: 140.12, symbol: "Ce", name: "Cerium" },
  ];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Peer Role Templates</Title>
        <Anchor href="new">
          <ActionIcon
            variant="filled"
            aria-label="Add Peer Role Template"
            size="lg"
          >
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <PeerRoleTemplatesTable peerroleTemplates={PeerRoleTemplatesTable} />
    </Stack>
  );
}
