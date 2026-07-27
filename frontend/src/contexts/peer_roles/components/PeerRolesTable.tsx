import { Stack, Table, Text } from "@mantine/core";

interface PeerRolesTableProps {
  peerRoles: PeerRole[];
}

interface PeerRole {
  role: number;
  name: string;
  summary: string;
}

export default function PeerRolesTable({ peerRoles }: PeerRolesTableProps) {
  const rows = peerRoles.map((role) => (
    <Table.Tr key={role.name}>
      <Table.Td>{role.role}</Table.Td>
      <Stack gap={1}>
        <Text>{role.name}</Text>
        <Text c="dimmed">{role.summary}</Text>
      </Stack>
      <Table.Td>edit</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Role</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
