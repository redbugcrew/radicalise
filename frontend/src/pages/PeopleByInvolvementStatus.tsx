import { Tabs } from "@mantine/core";
import { PeopleTable } from "../components";
import { InvolvementStatus, type CollectiveInvolvement, type CrewInvolvement } from "../api/Api";
import { useAppSelector } from "../store";
import { capitalCase } from "change-case";
import { useState } from "react";
import type { PeopleState } from "../store/people";
import type { PeopleTableRow } from "../components/PeopleTable/PeopleTable";
import type { CrewsState } from "../store/crews";

type HashById<T> = Map<number, T[]>;
type HashByStatus<T> = Map<InvolvementStatus, T[]>;

function hashByStatus<T extends { status: InvolvementStatus }>(records: T[]): HashByStatus<T> {
  const map = new Map<InvolvementStatus, T[]>();
  records.forEach((record) => {
    const status = InvolvementStatus[record.status as keyof typeof InvolvementStatus];
    if (!map.has(status)) {
      map.set(status, []);
    }
    map.get(status)?.push(record);
  });
  return map;
}

function hashByPerson<T extends { person_id: number }>(records: T[] | undefined): HashById<T> {
  const map = new Map<number, T[]>();

  if (!records) return map;

  records.forEach((record) => {
    if (!map.has(record.person_id)) {
      map.set(record.person_id, []);
    }
    map.get(record.person_id)?.push(record);
  });
  return map;
}

function peopleForInvolvements(involvements: CollectiveInvolvement[], allCrewInvolvements: HashById<CrewInvolvement>, allPeople: PeopleState, allCrews: CrewsState): PeopleTableRow[] {
  return involvements.map((involvement) => {
    const person = allPeople[involvement.person_id];
    const crewInvolvements = allCrewInvolvements.get(person.id) || [];

    return {
      id: person.id,
      name: person.display_name,
      crews: crewInvolvements.map((crewInvolvement) => allCrews[crewInvolvement.crew_id] || null).filter((crew) => crew),
    };
  });
}

interface PeopleByInvolvementStatusProps {
  involvements: CollectiveInvolvement[];
  crewEnrolments?: CrewInvolvement[];
  tableKey?: React.Key;
}

export default function PeopleByInvolvementStatus({ involvements, crewEnrolments, tableKey }: PeopleByInvolvementStatusProps) {
  const states = [InvolvementStatus.Participating, InvolvementStatus.OnHiatus];
  const [activeState, setActiveState] = useState<InvolvementStatus>(states[0]);

  const setActiveTab = (value: string | null) => {
    if (value === null) return states[0];

    setActiveState(InvolvementStatus[value as keyof typeof InvolvementStatus]);
  };

  const hashedInvolvements = hashByStatus(involvements);
  const hashedCrewEnrolments = hashByPerson(crewEnrolments);

  const allPeople = useAppSelector((state) => state.people);
  const allCrews = useAppSelector((state) => state.crews);

  return (
    <Tabs value={activeState} onChange={setActiveTab}>
      <Tabs.List>
        {states.map((state) => (
          <Tabs.Tab key={state} value={state.toString()}>
            {capitalCase(state.toString())}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {states.map((state) => (
        <Tabs.Panel value={state} key={state} pt="md">
          <PeopleTable key={tableKey} people={peopleForInvolvements(hashedInvolvements.get(state) || [], hashedCrewEnrolments, allPeople, allCrews)} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
