import { Group, Text } from "@mantine/core";
import type { PeerEnrollment, PeerRole } from "../../../api/Api";
import { PersonBadge } from "../../../components";
import { mapPeopleIds, type PeopleObjectMap } from "../../../store/people";

interface YourEnrollmentProps {
  enrollment: PeerEnrollment;
  role: PeerRole;
  personId: number;
  people: PeopleObjectMap;
  viewerPersonId?: number;
}

export default function YourEnrollment({ enrollment, role, personId, people, viewerPersonId }: YourEnrollmentProps) {
  const rolePersonIds = [enrollment.person_id, enrollment.peer_id];
  const rolePeople = mapPeopleIds(rolePersonIds, people);
  const otherPeople = rolePeople.filter((p) => p.id !== personId);

  const isYou = enrollment.person_id === viewerPersonId;

  return (
    <Group>
      <Text>
        {isYou ? "You are" : `${people[personId]?.display_name} is`} {role.name} with{" "}
      </Text>
      <Group>
        {otherPeople.map((person) => (
          <PersonBadge key={person.id} person={person} link />
        ))}
      </Group>
    </Group>
  );
}
