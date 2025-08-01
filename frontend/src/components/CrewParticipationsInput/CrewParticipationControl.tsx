import { Card, Group, Stack, Switch, Title, Text } from "@mantine/core";
import type { PeopleObjectMap } from "../../store/people";
import type { CrewInvolvement, Person } from "../../api/Api";
import styles from "./CrewParticipationsInput.module.css";
import { asPeopleAlphaSorted } from "../../store/involvements";
import PersonBadgeGroup from "../people/PersonBadge/PersonBadgeGroup";
import type { CrewWithLinks } from "../../store/crews";

export interface CrewParticipationControlData {
  participating: boolean;
  convenor: boolean;
  volunteered_convenor: boolean;
}

interface CrewParticipationToggleProps {
  value: CrewParticipationControlData;
  personId: number;
  crew: CrewWithLinks;
  crewInvolvements: CrewInvolvement[];
  previousInvolvements?: CrewInvolvement[] | null | undefined;
  people: PeopleObjectMap;
  disabled?: boolean;
  onChange?: (change: CrewParticipationControlData) => void;
}

function applyValue(crewInvolvements: CrewInvolvement[], crewId: number, personId: number, value: CrewParticipationControlData): CrewInvolvement[] {
  const result = crewInvolvements.filter((involvement) => involvement.person_id !== personId);
  if (value.participating) {
    result.push({
      id: 0, // dummy value
      interval_id: 0, // dummy value
      crew_id: crewId,
      person_id: personId,
      convenor: value.convenor,
      volunteered_convenor: value.volunteered_convenor,
    });
  }
  return result;
}

function forConvenor(crewInvolvements: CrewInvolvement[]): CrewInvolvement[] {
  return crewInvolvements.filter((involvement) => involvement.volunteered_convenor);
}

function sortMeLast(people: Person[], me: Person): Person[] {
  const meInList = people.find((person) => person.id === me.id);
  const listWithoutMe = people.filter((person) => person.id !== me.id);

  if (meInList) {
    return [...listWithoutMe, meInList];
  }
  return people;
}

function displayPeople(involvements: CrewInvolvement[], people: PeopleObjectMap, me: Person): Person[] {
  return sortMeLast(asPeopleAlphaSorted(involvements, people), me);
}

function hasOverlappingPeople(involvements1: CrewInvolvement[], involvements2: CrewInvolvement[]): boolean {
  const set1 = new Set(involvements1.map((i) => i.person_id));
  return involvements2.some((i) => set1.has(i.person_id));
}

export default function CrewParticipationControl({ value, personId, crew, crewInvolvements, people, disabled, onChange, previousInvolvements }: CrewParticipationToggleProps) {
  const person = people[personId];
  if (!person) return <p>Person not found</p>;

  const formInvolvements = applyValue(crewInvolvements, crew.id, personId, value);

  const handleOnChangeParticipating = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    if (onChange) onChange({ ...value, participating: checked });
  };

  const handleOnChangeVolunteeredConvenor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    if (onChange) onChange({ ...value, volunteered_convenor: checked });
  };

  const orderedPeople = displayPeople(formInvolvements, people, person);
  const orderedConvenorVolunteers = displayPeople(forConvenor(formInvolvements), people, person);

  const hasPeople = orderedPeople.length > 0;
  const hasConvenorVolunteers = orderedConvenorVolunteers.length > 0;
  const noOverlap = Array.isArray(previousInvolvements) && !hasOverlappingPeople(previousInvolvements, formInvolvements);

  let cardStyles = [styles.card];
  if (!hasPeople || !hasConvenorVolunteers) {
    cardStyles.push(styles.empty);
  } else if (noOverlap) {
    cardStyles.push(styles.noOverlap);
  }

  return (
    <Card className={cardStyles.join(" ")}>
      <Card.Section withBorder inheritPadding py="xs">
        <Stack key={crew.id} gap="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={4}>{crew.name}</Title>
              <Switch disabled={disabled} checked={value.participating} onChange={handleOnChangeParticipating} />
            </Group>
            {!hasPeople && <Text c="dimmed">Needs participants to go ahead.</Text>}
            {hasPeople && <PersonBadgeGroup people={orderedPeople} me={person} />}
            {hasPeople && noOverlap && <Text c="orange">No overlapping participants with last interval, this crew will go ahead but may lack context.</Text>}
          </Stack>
        </Stack>
      </Card.Section>
      {hasPeople && (
        <Card.Section withBorder inheritPadding py="xs">
          <Stack key={crew.id} gap="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Title order={5}>Convenor</Title>
                {value.participating && <Switch disabled={disabled} checked={value.volunteered_convenor} onChange={handleOnChangeVolunteeredConvenor} />}
              </Group>
              {!hasConvenorVolunteers && <Text c="dimmed">Needs convenor to go ahead.</Text>}
              {hasConvenorVolunteers && <PersonBadgeGroup people={orderedConvenorVolunteers} me={person} />}
            </Stack>
          </Stack>
        </Card.Section>
      )}
    </Card>
  );
}
