import { Badge, Table } from "@mantine/core";
import type { EntryPathway } from "../../api/Api";
import Anchor from "../Anchor";

interface EntryPathwayTableProps {
  entryPathways: EntryPathway[];
}

export default function EntryPathwayTable({ entryPathways }: EntryPathwayTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {entryPathways.map((entryPathway) => (
          <Table.Tr key={entryPathway.id}>
            <Table.Td>
              <Anchor href={`/entry_pathways/${entryPathway.id}`}>{entryPathway.name}</Anchor>
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
