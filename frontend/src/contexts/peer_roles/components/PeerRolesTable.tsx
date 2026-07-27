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

export default function PeerRolesTable({}: PeerRolesTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>#</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {/*{peerroleTemplates.map((template) => (
          <PeerRoleTemplateTableRow key={template.id} template={template} />
        ))}*/}
      </Table.Tbody>
    </Table>
  );
}
