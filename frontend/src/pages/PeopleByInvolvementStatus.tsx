import { Tabs } from "@mantine/core";
import { PeopleTable } from "../components";
import { InvolvementStatus, type Involvement } from "../api/Api";
import { useAppSelector } from "../store";
import { capitalCase } from "change-case";
import { useState } from "react";
import type { PeopleState } from "../store/people";
import type { PeopleTableRow } from "../components/PeopleTable/PeopleTable";

type InvolvementsHashById = Map<number, Involvement[]>;
type InvolvementsHashByStatus = Map<InvolvementStatus, Involvement[]>;

function hashInvolvementsByStatus(involvements: Involvement[]): InvolvementsHashByStatus {
  const map = new Map<InvolvementStatus, Involvement[]>();
  involvements.forEach((involvement) => {
    const status = InvolvementStatus[involvement.status as keyof typeof InvolvementStatus];
    if (!map.has(status)) {
      map.set(status, []);
    }
    map.get(status)?.push(involvement);
  });
  return map;
}

function hashInvolvementsByPerson(involvements: Involvement[] | undefined): InvolvementsHashById {
  const map = new Map<number, Involvement[]>();

  if (!involvements) return map;

  involvements.forEach((involvement) => {
    if (!map.has(involvement.person_id)) {
      map.set(involvement.person_id, []);
    }
    map.get(involvement.person_id)?.push(involvement);
  });
  return map;
}

function peopleForInvolvements(involvements: Involvement[], allCrewInvolvements: InvolvementsHashById, allPeople: PeopleState): PeopleTableRow[] {
  return involvements.map((involvement) => {
    const person = allPeople[involvement.person_id];
    const crewInvolvements = allCrewInvolvements.get(person.id) || [];

    return {
      id: person.id,
      name: person.display_name,
      groups: crewInvolvements.map((crewInvolvement) => ({
        id: crewInvolvement.id,
        name: crewInvolvement.group_id.toString(),
      })),
    };
  });
}

interface PeopleByInvolvementStatusProps {
  involvements: Involvement[];
  crewEnrolments?: Involvement[];
  tableKey?: React.Key;
}

export default function PeopleByInvolvementStatus({ involvements, crewEnrolments, tableKey }: PeopleByInvolvementStatusProps) {
  const states = [InvolvementStatus.Participating, InvolvementStatus.OnHiatus];
  const [activeState, setActiveState] = useState<InvolvementStatus>(states[0]);

  const setActiveTab = (value: string | null) => {
    if (value === null) return states[0];

    setActiveState(InvolvementStatus[value as keyof typeof InvolvementStatus]);
  };

  const hashedInvolvements = hashInvolvementsByStatus(involvements);
  const hashedCrewEnrolments = hashInvolvementsByPerson(crewEnrolments);

  const allPeople = useAppSelector((state) => state.people);

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
          <PeopleTable key={tableKey} people={peopleForInvolvements(hashedInvolvements.get(state) || [], hashedCrewEnrolments, allPeople)} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
