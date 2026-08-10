import { Stack, Group, Title } from "@mantine/core";
import PeerRolesTable from "../components/PeerRolesTable";
import { useAppSelector } from "../../../store";

export default function PeerRoles() {
  const peerRoles = useAppSelector((state) => state.peerRoles);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Peer Roles</Title>
        {/* <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Peer Role" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor> */}
      </Group>
      <PeerRolesTable peerRoles={Object.values(peerRoles)} />
    </Stack>
  );
}
