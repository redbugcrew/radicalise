import { Group, Text } from "@mantine/core";
import type { PeerEnrollment, PeerRole } from "../../../api/Api";
import { PersonBadge } from "../../../components";
import { mapPeopleIds, type PeopleObjectMap } from "../../../store/people";

interface YourEnrollmentProps {
  enrollment: PeerEnrollment;
  role: PeerRole;
  personId: number;
  people: PeopleObjectMap;
}

export default function YourEnrollment({ enrollment, role, personId, people }: YourEnrollmentProps) {
  const rolePersonIds = [enrollment.person_id, enrollment.peer_id];
  const rolePeople = mapPeopleIds(rolePersonIds, people);
  const otherPeople = rolePeople.filter((p) => p.id !== personId);

  return (
    <Group>
      <Text>You are {role.name} with </Text>
      <Group>
        {otherPeople.map((person) => (
          <PersonBadge key={person.id} person={person} link />
        ))}
      </Group>
    </Group>
  );
}
