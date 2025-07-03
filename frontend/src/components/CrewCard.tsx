import { Card, Group, Stack, Title, Text } from "@mantine/core";
import type { Crew, CrewInvolvement } from "../api/Api";
import PersonBadge from "./PersonBadge/PersonBadge";
import type { PeopleObjectMap } from "../store/people";
import { compareStrings } from "../utilities/comparison";

interface CrewCardProps {
  crew: Crew;
  involvements: CrewInvolvement[];
  people: PeopleObjectMap;
  highlightPersonId?: number;
}

export default function CrewCard({ crew, involvements, people, highlightPersonId }: CrewCardProps) {
  const crewPeople = involvements
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
            return <PersonBadge key={person.id} person={person} me={person.id === highlightPersonId} />;
          })}
        </Group>
      </Stack>
    </Card>
  );
}
