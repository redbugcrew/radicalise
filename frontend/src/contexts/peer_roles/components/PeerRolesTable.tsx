import { Table } from "@mantine/core";
import type { PeerRole } from "../../../api/Api";

interface PeerRolesTableProps {
  peerRoles: PeerRole[];
}

export default function PeerRolesTable({ peerRoles }: PeerRolesTableProps) {
  const rows = peerRoles.map((role) => (
    <Table.Tr key={role.name}>
      <Table.Td>{role.name}</Table.Td>
      <Table.Td>{role.summary}</Table.Td>
      <Table.Td>{role.distribution_type}</Table.Td>
      {/* <Table.Td>edit</Table.Td> */}
    </Table.Tr>
  ));

  return (
    <Table verticalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Role</Table.Th>
          <Table.Th>Summary</Table.Th>
          <Table.Th>Distribution</Table.Th>
          {/* <Table.Th>Actions</Table.Th> */}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
