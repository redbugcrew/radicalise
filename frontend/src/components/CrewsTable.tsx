import { Card, Group, Stack, Title, Text } from "@mantine/core";
import type { Crew, CrewInvolvement } from "../api/Api";
import { hashByNumber } from "../utilities/hashing";
import PersonBadge from "./PersonBadge/PersonBadge";
import type { PeopleObjectMap } from "../store/people";
import { compareStrings } from "../utilities/comparison";

interface CrewsTableProps {
  crews: Crew[];
  involvements: CrewInvolvement[];
  people: PeopleObjectMap;
}

export default function CrewsTable({ crews, involvements, people }: CrewsTableProps) {
  const involvementsHash = hashByNumber<CrewInvolvement>(involvements, "crew_id");

  return (
    <Stack>
      {crews.map((crew) => {
        const crewInvolvements = involvementsHash.get(crew.id) || [];
        const crewPeople = crewInvolvements
          .map((involvement) => people[involvement.person_id])
          .filter(Boolean)
          .sort(compareStrings("display_name"));

        return (
          <Card withBorder>
            <Stack gap="md">
              <Stack gap={0}>
                <Title order={2} size="h4">
                  {crew.name}
                </Title>
                <Text>{crew.description}</Text>
              </Stack>
              <Group>
                {crewPeople.map((person) => {
                  return <PersonBadge key={person.id} person={person} />;
                })}
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
