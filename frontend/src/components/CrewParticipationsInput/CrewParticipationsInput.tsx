import { Alert, Card, Group, Input, Stack, Switch, Title } from "@mantine/core";
import { forCrew } from "../../store/involvements";
import type { PeopleObjectMap } from "../../store/people";
import type { Crew, CrewInvolvement } from "../../api/Api";
import { PersonBadge } from "../";
import { useUncontrolled } from "@mantine/hooks";
import { IconScale } from "@tabler/icons-react";
import styles from "./CrewParticipationsInput.module.css";

interface CrewParticipationToggleProps {
  checked?: boolean;
  personId: number;
  crew: Crew;
  crewInvolvements: CrewInvolvement[];
  people: PeopleObjectMap;
  disabled?: boolean;
  onChange?: (change: boolean) => void;
}

function CrewParticipationToggle({ checked, personId, crew, crewInvolvements, people, disabled, onChange }: CrewParticipationToggleProps) {
  const otherInvolvements = crewInvolvements.filter((involvement) => involvement.person_id !== personId);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(event.target.checked);
  };

  const peopleOnCrew = otherInvolvements.length + (checked ? 1 : 0);

  return (
    <Card className={[styles.card, peopleOnCrew ? undefined : styles.empty].join(" ")}>
      <Stack key={crew.id} gap="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={4}>{crew.name}</Title>
            <Switch disabled={disabled} checked={checked} onChange={handleOnChange} />
          </Group>
          <Group mih={42}>
            {otherInvolvements.map((involvement) => {
              const person = people[involvement.person_id];
              return person && <PersonBadge key={involvement.id} person={person} />;
            })}
            {checked && <PersonBadge person={people[personId]} variant="primary" />}
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

interface GetInputPropsReturnType {
  onChange: any;
  value?: any;
  defaultValue?: any;
  checked?: any;
  defaultChecked?: any;
  error?: any;
  onFocus?: any;
  onBlur?: any;
}

type CrewParticipationsInputProps = GetInputPropsReturnType & {
  personId: number;
  crews: Crew[];
  people: PeopleObjectMap;
  disabled?: boolean;
  crewInvolvements: CrewInvolvement[];
};

function upsertId(arr: number[], id: number): number[] {
  const result = removeId(arr, id);
  result.push(id);
  return result;
}

function removeId(arr: number[], id: number): number[] {
  return arr.filter((item) => item !== id);
}

function toggleId(arr: number[], id: number, checked: boolean): number[] {
  if (checked) {
    return upsertId(arr, id);
  }
  return removeId(arr, id);
}

export default function CrewParticipationsInput({ crews, personId, people, disabled, crewInvolvements, ...rest }: CrewParticipationsInputProps) {
  const [value, setValue] = useUncontrolled<number[]>({
    value: rest.value,
    defaultValue: rest.defaultValue,
    finalValue: [],
    onChange: rest.onChange,
  });

  const handleChange = (crewId: number, itemValue: boolean) => {
    if (!disabled) {
      const newValue = toggleId(value, crewId, itemValue);
      setValue(newValue);
    }
  };

  if (crews.length === 0) {
    return <Title order={4}>No crews available. Please create a crew first.</Title>;
  }

  return (
    <Input.Wrapper {...rest}>
      <Stack>
        <Stack>
          {crews.map((crew) => (
            <CrewParticipationToggle
              key={crew.id}
              personId={personId}
              checked={value.includes(crew.id)}
              crew={crew}
              crewInvolvements={forCrew(crewInvolvements, crew.id)}
              people={people}
              disabled={disabled}
              onChange={(change) => handleChange(crew.id, change)}
            />
          ))}
        </Stack>
        {value.length > 2 && (
          <Alert title="Pace yourself comrade" variant="outline" color="blue" icon={<IconScale />}>
            Are you sure you want to be part of more than 2 crews?
          </Alert>
        )}
      </Stack>
    </Input.Wrapper>
  );
}
