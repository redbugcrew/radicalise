import { Card, Group, Stack, Title, Text, Badge } from "@mantine/core";
import type { Crew, CrewInvolvement, Person } from "../../../api/Api";
import PersonBadge from "../../PersonBadge/PersonBadge";
import type { PeopleObjectMap } from "../../../store/people";
import styles from "./CrewCard.module.css";
import Anchor from "../../Anchor";

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

  const hasPeople = crewPeople.length > 0;
  const hasConvenor = crewPeople.some(({ involvement }) => involvement.convenor);
  const active = hasPeople && hasConvenor;

  const cardStyles = [styles.card];
  if (!active) cardStyles.push(styles.empty);

  return (
    <Card className={cardStyles.join(" ")}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Group>
              <Title order={2} size="h4">
                {crew.name}
              </Title>
              <Anchor c="dimmed" href={`/crews/${crew.id}/edit`} size="xs">
                edit
              </Anchor>
            </Group>
            <Text>{crew.description}</Text>
          </Stack>
          {!active && <Badge color="orange">Inactive</Badge>}
          {active && <Badge color="green">Active</Badge>}
        </Group>
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
