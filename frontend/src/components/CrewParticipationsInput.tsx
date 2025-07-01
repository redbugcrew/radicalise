import { Card, Group, Input, Stack, Switch, Title } from "@mantine/core";
import { forCrew } from "../store/involvements";
import type { Crew, CrewInvolvement } from "../api/Api";
import type { PeopleObjectMap } from "../store/people";
import { PersonBadge } from ".";

type FormFieldChange<T> = {
  previousValue: T;
  value: T;
  touched: boolean;
  dirty: boolean;
};

interface CrewParticipationToggleProps {
  personId: number;
  crew: Crew;
  crewInvolvements: CrewInvolvement[];
  people: PeopleObjectMap;
  disabled?: boolean;
  onChange?: (change: FormFieldChange<string[]>) => void;
}

function CrewParticipationToggle({ personId, crew, crewInvolvements, people, disabled, onChange }: CrewParticipationToggleProps) {
  const otherInvolvements = crewInvolvements.filter((involvement) => involvement.person_id !== personId);

  const sampleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Sample onChange event:", event);
  };

  return (
    <Card>
      <Stack key={crew.id} gap="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={4}>{crew.name}</Title>
            <Switch disabled={disabled} onChange={sampleOnChange} />
          </Group>
          <Group>
            {otherInvolvements.map((involvement) => {
              const person = people[involvement.person_id];
              return person && <PersonBadge key={involvement.id} person={person} />;
            })}
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

export default function CrewParticipationsInput({ crews, personId, people, disabled, crewInvolvements, ...rest }: CrewParticipationsInputProps) {
  const onToggleChange = (crewId: number, change: FormFieldChange<string[]>) => {
    console.log("Toggle change for crew:", crewId, change);
    if (rest.onChange) {
      rest.onChange([crewId]);
    }
  };

  return (
    <Input.Wrapper {...rest}>
      <Stack>
        <p>{JSON.stringify(rest)}</p>
        {crews.map((crew) => (
          <CrewParticipationToggle
            key={crew.id}
            personId={personId}
            crew={crew}
            crewInvolvements={forCrew(crewInvolvements, crew.id)}
            people={people}
            disabled={disabled}
            onChange={(change) => onToggleChange(crew.id, change)}
          />
        ))}
      </Stack>
    </Input.Wrapper>
  );
}
