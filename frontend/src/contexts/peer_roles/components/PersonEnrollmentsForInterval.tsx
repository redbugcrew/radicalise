import type { Person, PeerEnrollment, Interval } from "../../../api/Api";
import { Stack } from "@mantine/core";
import { useAppSelector } from "../../../store";
import { initiatingFromPerson } from "../../../store/current_interval/peer_enrollments";
import YourEnrollment from "./YourEnrollment";
import type { CurrentIntervalState } from "../../../store/current_interval";

interface PersonEnrollmentsForIntervalProps {
  person: Person;
  intervalData: CurrentIntervalState;
  viewerPersonId?: number;
}

export default function PersonEnrollmentsForInterval({ person, intervalData, viewerPersonId }: PersonEnrollmentsForIntervalProps) {
  const roles = useAppSelector((state) => state.peerRoles);
  const people = useAppSelector((state) => state.people);
  const allEnrollments = intervalData?.peer_enrollments || [];

  const myEnrollments = initiatingFromPerson(allEnrollments, person.id);

  if (myEnrollments.length === 0) return null;

  return (
    <Stack>
      {myEnrollments.map((enrollment: PeerEnrollment) => {
        const role = roles[enrollment.peer_role_id];
        if (!role) return null;

        return <YourEnrollment key={enrollment.id} enrollment={enrollment} role={role} personId={person.id} people={people} viewerPersonId={viewerPersonId} />;
      })}
    </Stack>
  );
}
