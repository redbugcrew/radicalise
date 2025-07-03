import { Alert, Input, Stack, Title } from "@mantine/core";
import { forCrew } from "../../store/involvements";
import type { PeopleObjectMap } from "../../store/people";
import type { Crew, CrewInvolvement } from "../../api/Api";
import { useUncontrolled } from "@mantine/hooks";
import { IconScale } from "@tabler/icons-react";
import CrewParticipationControl, { type CrewParticipationControlData } from "./CrewParticipationControl";

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
  intervalId: number;
  crews: Crew[];
  people: PeopleObjectMap;
  disabled?: boolean;
  crewInvolvements: CrewInvolvement[];
};

function upsertData(arr: CrewInvolvement[], record: CrewInvolvement): CrewInvolvement[] {
  const result = removeData(arr, record);
  result.push(record);
  return result;
}

function removeData(arr: CrewInvolvement[], record: CrewInvolvement): CrewInvolvement[] {
  return arr.filter((item) => item.crew_id !== record.crew_id);
}

function toggleData(arr: CrewInvolvement[], record: CrewInvolvement, checked: boolean): CrewInvolvement[] {
  if (checked) {
    return upsertData(arr, record);
  }
  return removeData(arr, record);
}

function toControlData(data: CrewInvolvement[], crewId: number): CrewParticipationControlData {
  const record = data.find((item) => item.crew_id === crewId);
  return {
    participating: !!record,
    convenor: record?.convenor || false,
    volunteered_convenor: record?.volunteered_convenor || false,
  };
}

export default function CrewParticipationsInput({ crews, personId, intervalId, people, disabled, crewInvolvements, ...rest }: CrewParticipationsInputProps) {
  const [value, setValue] = useUncontrolled<CrewInvolvement[]>({
    value: rest.value,
    defaultValue: rest.defaultValue,
    finalValue: [],
    onChange: rest.onChange,
  });

  const handleChange = (crewId: number, itemValue: CrewParticipationControlData) => {
    if (!disabled) {
      const defaultRecord: CrewInvolvement = {
        id: 0, // This will be set by the backend
        crew_id: crewId,
        person_id: personId,
        interval_id: intervalId,
        convenor: false,
        volunteered_convenor: itemValue.volunteered_convenor,
      };
      const existingRecord = value.find((item) => item.crew_id === crewId);

      const newRecord: CrewInvolvement = {
        ...defaultRecord,
        ...existingRecord,
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
