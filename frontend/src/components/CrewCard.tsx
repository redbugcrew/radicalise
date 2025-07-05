import { Card, Group, Stack, Title, Text } from "@mantine/core";
import type { Crew, CrewInvolvement, Person } from "../api/Api";
import PersonBadge from "./PersonBadge/PersonBadge";
import type { PeopleObjectMap } from "../store/people";

interface CrewCardProps {
  crew: Crew;
  involvements: CrewInvolvement[];
  people: PeopleObjectMap;
  highlightPersonId?: number;
}

interface PersonAndInvolvement {
  person: Person;
  involvement: CrewInvolvement;
}

function sortByConvenorThenName(a: PersonAndInvolvement, b: PersonAndInvolvement): number {
  if (a.involvement.convenor && !b.involvement.convenor) {
    return -1;
  } else if (!a.involvement.convenor && b.involvement.convenor) {
    return 1;
  } else {
    return a.person.display_name.localeCompare(b.person.display_name);
  }
}

export default function CrewCard({ crew, involvements, people, highlightPersonId }: CrewCardProps) {
  const crewPeople: PersonAndInvolvement[] = involvements
    .map((involvement) => ({ involvement, person: people[involvement.person_id] }))
    .filter(({ person }) => person)
    .sort(sortByConvenorThenName);

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
          {crewPeople.map(({ person, involvement }) => {
            const convenor = involvement?.convenor;

            return <PersonBadge key={person.id} person={person} me={person.id === highlightPersonId} highlight={convenor} />;
          })}
        </Group>
      </Stack>
    </Card>
  );
}
