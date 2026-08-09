import { Group } from "@mantine/core";
import type { PeerEnrollment, PeerRole } from "../../../api/Api";
import { PersonBadge } from "../../../components";
import { type PeopleObjectMap } from "../../../store/people";
import type { PersonBadgeProps } from "../../../components/people/PersonBadge/PersonBadge";
import { IconArrowBigRight } from "@tabler/icons-react";

interface YourEnrollmentProps {
  enrollment: PeerEnrollment;
  role: PeerRole;
  people: PeopleObjectMap;
  viewerPersonId?: number;
}

interface YouOrPersonBadgeProps extends PersonBadgeProps {
  viewerPersonId: number | undefined;
}

function YouOrPersonBadge({ person, viewerPersonId }: YouOrPersonBadgeProps) {
  const isYou = person?.id === viewerPersonId;

  return isYou ? "you" : <PersonBadge person={person} link />;
}

export default function EnrollmentLine({ enrollment, role, people, viewerPersonId }: YourEnrollmentProps) {
  const person = people[enrollment.person_id];
  const peer = people[enrollment.peer_id];

  return (
    <Group gap="xs">
      <YouOrPersonBadge person={person} viewerPersonId={viewerPersonId} link />
      <IconArrowBigRight />
      <YouOrPersonBadge person={peer} viewerPersonId={viewerPersonId} link />
    </Group>
  );
}
