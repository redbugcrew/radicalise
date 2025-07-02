import { Card, Group, Stack, Switch, Title } from "@mantine/core";
import type { PeopleObjectMap } from "../../store/people";
import type { Crew, CrewInvolvement } from "../../api/Api";
import { PersonBadge } from "../";
import styles from "./CrewParticipationsInput.module.css";
import { compareStrings } from "../../utilities/comparison";

type CrewParticipationData = boolean;

interface CrewParticipationToggleProps {
  checked?: CrewParticipationData;
  personId: number;
  crew: Crew;
  crewInvolvements: CrewInvolvement[];
  people: PeopleObjectMap;
  disabled?: boolean;
  onChange?: (change: CrewParticipationData) => void;
}

export default function CrewParticipationControl({ checked, personId, crew, crewInvolvements, people, disabled, onChange }: CrewParticipationToggleProps) {
  const otherInvolvements = crewInvolvements.filter((involvement) => involvement.person_id !== personId);
  const otherPeople = otherInvolvements
    .map((involvement) => people[involvement.person_id])
    .filter(Boolean)
    .sort(compareStrings("display_name"));

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(event.target.checked);
  };

  const peopleOnCrew = otherPeople.length + (checked ? 1 : 0);

  return (
    <Card className={[styles.card, peopleOnCrew ? undefined : styles.empty].join(" ")}>
      <Card.Section withBorder inheritPadding py="xs">
        <Stack key={crew.id} gap="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={4}>{crew.name}</Title>
              <Switch disabled={disabled} checked={checked} onChange={handleOnChange} />
            </Group>
            <Group mih={42}>
              {otherPeople.map((person) => {
                return person && <PersonBadge key={person.id} person={person} />;
              })}
              {checked && <PersonBadge person={people[personId]} variant="primary" />}
            </Group>
          </Stack>
        </Stack>
      </Card.Section>
      <Card.Section withBorder inheritPadding py="xs">
        <Stack key={crew.id} gap="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={5}>Convenor</Title>
              <Switch disabled={disabled} checked={checked} onChange={handleOnChange} />
            </Group>
            <Group mih={42}>
              {otherPeople.map((person) => {
                return person && <PersonBadge key={person.id} person={person} />;
              })}
              {checked && <PersonBadge person={people[personId]} variant="primary" />}
            </Group>
          </Stack>
        </Stack>
      </Card.Section>
    </Card>
  );
}
