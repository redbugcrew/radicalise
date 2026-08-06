import { Stack, Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
//import { Anchor } from "@mantine/core";
import { Anchor } from "../../../components";
import PeerRolesTable from "../components/PeerRolesTable";

export default function PeerRoles() {
  const dummyPeers = [
    {
      role: 1,
      name: "Participation Buddy",
      summary:
        "Participation Buddies support each-other to communicate and meet our participation intentions in the project",
    },
    {
      role: 2,
      name: "Care Supporter",
      summary:
        "The role of Care Supporters is to offer a holding space to practice expressing our feelings and reflecting on our experiences without exposing ourselves to either judgement or rescue.",
    },
    {
      role: 3,
      name: "Accountability Supporter",
      summary:
        "The role of Accountability supporters is to offer gentle challenges to practice reflecting on alternative perspectives and holding ourselves accountable for how our actions impact others (without policing each others' behaviour).",
    },
  ];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Peer Roles</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Peer Role" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <PeerRolesTable peerRoles={dummyPeers} />
    </Stack>
  );
}
