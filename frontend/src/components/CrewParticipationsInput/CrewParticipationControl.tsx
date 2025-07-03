import { Card, Group, Stack, Switch, Title } from "@mantine/core";
import type { PeopleObjectMap } from "../../store/people";
import type { Crew, CrewInvolvement, Person } from "../../api/Api";
import { PersonBadge } from "../";
import styles from "./CrewParticipationsInput.module.css";
import { asPeopleAlphaSorted, notForPerson } from "../../store/involvements";
import PersonBadgeGroup from "../PersonBadge/PersonBadgeGroup";

export interface CrewParticipationControlData {
  participating: boolean;
  convenor: boolean;
  volunteered_convenor: boolean;
}

interface CrewParticipationToggleProps {
  value: CrewParticipationControlData;
  personId: number;
  crew: Crew;
  crewInvolvements: CrewInvolvement[];
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

export default function CrewParticipationControl({ value, personId, crew, crewInvolvements, people, disabled, onChange }: CrewParticipationToggleProps) {
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

  const peopleOnCrew = formInvolvements.length > 0;

  return (
    <Card className={[styles.card, peopleOnCrew ? undefined : styles.empty].join(" ")}>
      <Card.Section withBorder inheritPadding py="xs">
        <Stack key={crew.id} gap="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={4}>{crew.name}</Title>
              <Switch disabled={disabled} checked={value.participating} onChange={handleOnChangeParticipating} />
            </Group>
            <PersonBadgeGroup people={orderedPeople} highlightMe={person} />
          </Stack>
        </Stack>
      </Card.Section>
      <Card.Section withBorder inheritPadding py="xs">
        <Stack key={crew.id} gap="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={5}>Convenor</Title>
              {value.participating && <Switch disabled={disabled} checked={value.volunteered_convenor} onChange={handleOnChangeVolunteeredConvenor} />}
            </Group>
            <PersonBadgeGroup people={orderedConvenorVolunteers} highlightMe={person} />
          </Stack>
        </Stack>
      </Card.Section>
    </Card>
  );
}
