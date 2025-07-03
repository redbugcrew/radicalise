import { Group } from "@mantine/core";
import type { Person } from "../../api/Api";
import PersonBadge from "./PersonBadge";

interface PersonBadgeGroupProps {
  people: Person[];
  highlightMe?: Person | undefined;
}

export default function PersonBadgeGroup({ people, highlightMe }: PersonBadgeGroupProps) {
  return (
    <Group mih={42}>
      {people.map((person) => (
        <PersonBadge key={person.id} person={person} variant={highlightMe === person ? "primary" : "default"} />
      ))}
    </Group>
  );
}
