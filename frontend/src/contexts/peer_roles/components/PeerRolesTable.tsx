import { Stack, Table, Text } from "@mantine/core";
import { Anchor } from "../../../components";

interface PeerRolesTableProps {}

//function PeerRoleTableRow({
//  template,
//}: {
//  template: PeerRoleTemplate;
//}) {
//  if (!template) return null;
//
//  return (
//    <Table.Tr key={template.id}>
//      <Table.Td>{template.id}</Table.Td>
//      <Table.Td>
//        <Stack gap={0}>
//          <Text>{template.name}</Text>
//          <Text c="dimmed">{template.summary}</Text>
//        </Stack>
//      </Table.Td>
//      <Table.Td>
//        <Anchor href={`${template.id}/edit`}>Edit</Anchor>
//      </Table.Td>
//    </Table.Tr>
//  );
//}

const dummypeers = [
  { Identity: 1, Name: "Seb", Action: "Buddy" },
  { Identity: 4, Name: "Leah", Action: "Buddy" },
];

export default function PeerRolesTable({}: PeerRolesTableProps) {
  const rows = dummypeers.map((dummypeers) => (
    <Table.Tr key={dummypeers.Name}>
      <Table.Td>{dummypeers.Identity}</Table.Td>
      <Table.Td>{dummypeers.Name}</Table.Td>
      <Table.Td>{dummypeers.Action}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Identity</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
