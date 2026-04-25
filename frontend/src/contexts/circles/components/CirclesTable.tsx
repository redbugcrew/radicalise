import { Anchor, Table } from "@mantine/core";
import type { Circle } from "../../../api/Api";

interface CirclesTableProps {
  circles: Circle[] | null;
}

function CirclesTableRow({ circle }: { circle: Circle }) {
  if (!circle) return null;

  return (
    <Table.Tr key={circle.id}>
      <Table.Td>{circle.name}</Table.Td>
      <Table.Td maw={12} ta="right">
        <Anchor href={`circles/${circle.slug}/edit`}>Edit</Anchor>
      </Table.Td>
    </Table.Tr>
  );
}

export default function CirclesTable({ circles }: CirclesTableProps) {
  if (circles === null) return null;

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th maw={12} ta="right">
            Actions
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {circles.map((circle) => (
          <CirclesTableRow key={circle.id} circle={circle} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
