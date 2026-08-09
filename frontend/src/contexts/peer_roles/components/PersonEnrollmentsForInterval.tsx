import { useAppSelector } from "../../../store";
import { involvingPerson } from "../../../store/current_interval/peer_enrollments";
import type { CurrentIntervalState } from "../../../store/current_interval";
import GroupedEnrollments from "./GroupedEnrollments";

interface PersonEnrollmentsForIntervalProps {
  subjectPersonId: number;
  intervalData: CurrentIntervalState;
  viewerPersonId?: number;
}

export default function PersonEnrollmentsForInterval({ subjectPersonId, intervalData, viewerPersonId }: PersonEnrollmentsForIntervalProps) {
  const roles = useAppSelector((state) => state.peerRoles);
  const people = useAppSelector((state) => state.people);
  const allEnrollments = intervalData?.peer_enrollments || [];

  const subjectEnrollments = involvingPerson(allEnrollments, subjectPersonId);

  return <GroupedEnrollments enrollments={subjectEnrollments} viewerPersonId={viewerPersonId} roles={roles} people={people} />;
}
