import { Badge, Table } from "@mantine/core";
import type { Eoi } from "../../api/Api";
import Anchor from "../Anchor";

interface EoiTableProps {
  eois: Eoi[];
}

export default function EoiTable({ eois }: EoiTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {eois.map((eoi) => (
          <Table.Tr key={eoi.id}>
            <Table.Td>
              <Anchor href={`/invitations/${eoi.id}`}>{eoi.name}</Anchor>
            </Table.Td>
            <Table.Td>
              <Badge color="blue">EOI</Badge>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
