import { Group, Stack, Table } from "@mantine/core";
import type { Crew, CrewInvolvement } from "../api/Api";
import { hashByNumber } from "../utilities/hashing";
import PersonBadge from "./PersonBadge/PersonBadge";
import type { PeopleObjectMap } from "../store/people";

interface CrewsTableProps {
  crews: Crew[];
  involvements: CrewInvolvement[];
  people: PeopleObjectMap;
}

export default function CrewsTable({ crews, involvements, people }: CrewsTableProps) {
  const involvementsHash = hashByNumber<CrewInvolvement>(involvements, "crew_id");

  return (
    <Stack align="stretch">
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Participant(s)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {crews.map((crew) => {
            const crewInvolvements = involvementsHash.get(crew.id) || [];
            return (
              <Table.Tr key={crew.id}>
                <Table.Td>{crew.name}</Table.Td>
                <Table.Td>{crew.description}</Table.Td>
                <Table.Td>
                  <Group>
                    {crewInvolvements.map((involvement) => (
                      <PersonBadge key={involvement.id} person={people[involvement.person_id]} />
                    ))}
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
