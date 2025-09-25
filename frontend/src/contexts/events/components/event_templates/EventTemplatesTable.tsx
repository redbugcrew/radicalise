import { Table } from "@mantine/core";
import type { EventTemplate } from "../../../../api/Api";
import { Anchor } from "../../../../components";

interface EventTemplatesTableProps {
  eventTemplates: EventTemplate[];
}

function EventTemplateTableRow({ template }: { template: EventTemplate }) {
  if (!template) return null;

  return (
    <Table.Tr key={template.id}>
      <Table.Td>{template.id}</Table.Td>
      <Table.Td>{template.name}</Table.Td>
      <Table.Td>
        <Anchor href={`${template.id}/edit`}>Edit</Anchor>
      </Table.Td>
    </Table.Tr>
  );
}

export default function EventTemplatesTable({ eventTemplates }: EventTemplatesTableProps) {
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
        {eventTemplates.map((template) => (
          <EventTemplateTableRow key={template.id} template={template} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
