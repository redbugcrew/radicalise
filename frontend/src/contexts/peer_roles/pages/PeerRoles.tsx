import { Stack, Group, Title, Text } from "@mantine/core"
import PeerRolesTable from "../components/PeerRolesTable"
import { useAppSelector } from "../../../store"
import NoData from "../../../components/NoData"

export default function PeerRoles() {
  const peerRoles = Object.values(useAppSelector((state) => state.peerRoles))

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

      {peerRoles.length === 0 ? (
        <NoData title="No peer roles">
          <Stack>
            <Text>
              Peer roles allow you to determine types peer support between people in the project, such as implementing a buddy system.
            </Text>
          </Stack>
        </NoData>
      ) : (
        <PeerRolesTable peerRoles={peerRoles} />
      )}
    </Stack>
  )
}
