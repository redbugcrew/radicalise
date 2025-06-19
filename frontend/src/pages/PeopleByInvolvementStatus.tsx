import { Tabs } from "@mantine/core";
import { PeopleTable } from "../components";
import { InvolvementStatus, type Involvement } from "../api/Api";
import { useAppSelector } from "../store";
import { capitalCase } from "change-case";
import { useState } from "react";
import type { PeopleState } from "../store/people";
import type { PeopleTableRow } from "../components/PeopleTable/PeopleTable";

function hashInvolvementsByStatus(involvements: Involvement[]): Map<InvolvementStatus, Involvement[]> {
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

function peopleForInvolvements(involvements: Involvement[], allPeople: PeopleState): PeopleTableRow[] {
  return involvements.map((involvement) => {
    const person = allPeople[involvement.person_id];
    return {
      id: person.id,
      name: person.display_name,
      groups: [],
    };
  });
}

export default function PeopleByInvolvementStatus({ involvements }: { involvements: Involvement[] }) {
  const states = [InvolvementStatus.Participating, InvolvementStatus.OnHiatus];
  const [activeState, setActiveState] = useState<InvolvementStatus>(states[0]);

  const setActiveTab = (value: string | null) => {
    if (value === null) return states[0];

    setActiveState(InvolvementStatus[value as keyof typeof InvolvementStatus]);
  };

  const hashedInvolvements = hashInvolvementsByStatus(involvements);
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
          <PeopleTable people={peopleForInvolvements(hashedInvolvements.get(state) || [], allPeople)} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
