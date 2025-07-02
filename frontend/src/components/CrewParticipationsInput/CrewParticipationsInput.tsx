import { Alert, Input, Stack, Title } from "@mantine/core";
import { forCrew } from "../../store/involvements";
import type { PeopleObjectMap } from "../../store/people";
import type { Crew, CrewInvolvement } from "../../api/Api";
import { useUncontrolled } from "@mantine/hooks";
import { IconScale } from "@tabler/icons-react";
import CrewParticipationControl, { type CrewParticipationData } from "./CrewParticipationControl";

type CrewParticipationsData = number[];

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
  const [value, setValue] = useUncontrolled<CrewParticipationsData>({
    value: rest.value,
    defaultValue: rest.defaultValue,
    finalValue: [],
    onChange: rest.onChange,
  });

  const handleChange = (crewId: number, itemValue: CrewParticipationData) => {
    if (!disabled) {
      const newValue = toggleId(value, crewId, itemValue.participating);
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
            <CrewParticipationControl
              key={crew.id}
              personId={personId}
              value={value.includes(crew.id) ? { participating: true } : { participating: false }}
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
