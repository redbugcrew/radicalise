import { Alert, Input, Stack, Title } from "@mantine/core";
import { forCrew } from "../../store/involvements";
import type { PeopleObjectMap } from "../../store/people";
import type { Crew, CrewInvolvement } from "../../api/Api";
import { useUncontrolled } from "@mantine/hooks";
import { IconScale } from "@tabler/icons-react";
import CrewParticipationControl, { type CrewParticipationControlData } from "./CrewParticipationControl";

export interface CrewParticipationData {
  crew_id: number;
  convenor: boolean;
  volunteered_convenor: boolean;
}

export type CrewParticipationsData = CrewParticipationData[];

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

function upsertData(arr: CrewParticipationsData, record: CrewParticipationData): CrewParticipationsData {
  const result = removeData(arr, record);
  result.push(record);
  return result;
}

function removeData(arr: CrewParticipationsData, record: CrewParticipationData): CrewParticipationsData {
  return arr.filter((item) => item.crew_id !== record.crew_id);
}

function toggleData(arr: CrewParticipationsData, record: CrewParticipationData, checked: boolean): CrewParticipationsData {
  if (checked) {
    return upsertData(arr, record);
  }
  return removeData(arr, record);
}

function hasCrew(arr: CrewParticipationsData, crewId: number): boolean {
  return arr.some((item) => item.crew_id === crewId);
}

export function dataFromInvolvements(crewInvolvements: CrewInvolvement[]): CrewParticipationsData {
  return crewInvolvements.map((involvement) => ({
    crew_id: involvement.crew_id,
    convenor: involvement.convenor,
    volunteered_convenor: involvement.volunteered_convenor,
  }));
}

function toControlData(data: CrewParticipationsData, crewId: number): CrewParticipationControlData {
  const record = data.find((item) => item.crew_id === crewId);
  return {
    participating: !!record,
    convenor: record?.convenor || false,
    volunteered_convenor: record?.volunteered_convenor || false,
  };
}

export default function CrewParticipationsInput({ crews, personId, people, disabled, crewInvolvements, ...rest }: CrewParticipationsInputProps) {
  const [value, setValue] = useUncontrolled<CrewParticipationsData>({
    value: rest.value,
    defaultValue: rest.defaultValue,
    finalValue: [],
    onChange: rest.onChange,
  });

  const handleChange = (crewId: number, itemValue: CrewParticipationControlData) => {
    if (!disabled) {
      const newRecord = {
        crew_id: crewId,
        convenor: itemValue.convenor,
        volunteered_convenor: itemValue.volunteered_convenor,
      };
      const newValue = toggleData(value, newRecord, itemValue.participating);
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
              value={toControlData(value, crew.id)}
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
