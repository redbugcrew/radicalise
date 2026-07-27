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
  {
    Role: 1,
    Name: "Buddy",
    Summary:
      "Participation Buddies support each-other to communicate and meet our participation intentions in the project",
    Action: "edit",
  },
  {
    Role: 2,
    Name: "Care Supporter",
    Summary:
      "The role of Care Supporters is to offer a holding space to practice expressing our feelings and reflecting on our experiences without exposing ourselves to either judgement or rescue.",
    Action: "edit",
  },
  {
    Role: 3,
    Name: "Accountability Supporter",
    Summary:
      "The role of Accountability supporters is to offer gentle challenges to practice reflecting on alternative perspectives and holding ourselves accountable for how our actions impact others (without policing each others' behaviour).",
    Action: "edit",
  },
];

export default function PeerRolesTable({}: PeerRolesTableProps) {
  const rows = dummypeers.map((dummypeers) => (
    <Table.Tr key={dummypeers.Name}>
      <Table.Td>{dummypeers.Role}</Table.Td>
      <Stack gap={1}>
        <Text>{dummypeers.Name}</Text>
        <Text c="dimmed">{dummypeers.Summary}</Text>
      </Stack>
      <Table.Td>{dummypeers.Action}</Table.Td>
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
