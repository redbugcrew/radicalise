import { Tabs } from "@mantine/core";
import { PeopleTable } from "../../components";
import { InvolvementStatus, type CollectiveInvolvement, type CrewInvolvement } from "../../api/Api";
import { useAppSelector } from "../../store";
import { capitalCase } from "change-case";
import { useEffect, useState } from "react";
import type { PeopleState } from "../../store/people";
import type { PeopleTableRow } from "../../components/people/PeopleTable/PeopleTable";
import type { CrewsState } from "../../store/crews";
import { hashByPerson, hashByStatus, type HashById } from "../../utilities/hashing";

function peopleForInvolvements(involvements: CollectiveInvolvement[], allCrewInvolvements: HashById<CrewInvolvement>, allPeople: PeopleState, allCrews: CrewsState): PeopleTableRow[] {
  return involvements.map((involvement) => {
    const person = allPeople[involvement.person_id];
    const crewInvolvements = allCrewInvolvements.get(person.id) || [];

    return {
      id: person.id,
      name: person.display_name,
      avatar_id: person.avatar_id ?? person.id,
      capacity_score: involvement.capacity_score ?? null,
      dimmed: !involvement.participation_intention,
      counter: involvement.implicit_counter,
      crews: crewInvolvements.map((crewInvolvement) => allCrews[crewInvolvement.crew_id] || null).filter((crew) => crew),
    };
  });
}

interface PeopleByInvolvementStatusProps {
  involvements: CollectiveInvolvement[];
  crewEnrolments?: CrewInvolvement[];
  tableKey?: React.Key;
  intervalId?: number | null;
}

export default function PeopleByInvolvementStatus({ involvements, crewEnrolments, tableKey, intervalId }: PeopleByInvolvementStatusProps) {
  const states = [InvolvementStatus.Participating];
  involvements.forEach((involvement) => {
    if (states.indexOf(involvement.status) === -1) {
      states.push(involvement.status);
    }
  });

  const [activeState, setActiveState] = useState<InvolvementStatus>(states[0]);

  const setActiveTab = (value: string | null) => {
    if (value === null) return states[0];

    setActiveState(InvolvementStatus[value as keyof typeof InvolvementStatus]);
  };

  useEffect(() => {
    console.log("involvements have changed to: ", involvements);
  }, [involvements]);

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
        <Tabs.Panel value={state} key={`${state}-${tableKey}`} pt="md">
          <PeopleTable key={tableKey} people={peopleForInvolvements(hashedInvolvements.get(state) || [], hashedCrewEnrolments, allPeople, allCrews)} intervalId={intervalId} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
