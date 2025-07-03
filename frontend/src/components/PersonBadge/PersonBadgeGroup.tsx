import { Group } from "@mantine/core";
import type { Person } from "../../api/Api";
import PersonBadge from "./PersonBadge";

interface PersonBadgeGroupProps {
  people: Person[];
  me?: Person | undefined;
  highlight?: Person | undefined;
}

export default function PersonBadgeGroup({ people, me, highlight }: PersonBadgeGroupProps) {
  return (
    <Group mih={42}>
      {people.map((person) => (
        <PersonBadge key={person.id} person={person} me={me === person} highlight={highlight === person} />
      ))}
    </Group>
  );
}
