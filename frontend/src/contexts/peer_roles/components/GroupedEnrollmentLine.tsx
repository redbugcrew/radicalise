import { Group, Stack, Tooltip } from "@mantine/core";
import type { PeerEnrollment, PeerRole } from "../../../api/Api";
import { PersonBadge } from "../../../components";
import { type PeopleObjectMap } from "../../../store/people";
import type { PersonBadgeProps } from "../../../components/people/PersonBadge/PersonBadge";
import { IconArrowBigRight } from "@tabler/icons-react";

interface GroupedEnrollmentLineProps {
  enrollments: PeerEnrollment[];
  subjectPersonId: number;
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

export default function GroupedEnrollmentLine({ enrollments, subjectPersonId, role, people, viewerPersonId }: GroupedEnrollmentLineProps) {
  const incoming = enrollments.filter((e) => e.peer_id == subjectPersonId);
  const outgoing = enrollments.filter((e) => e.person_id == subjectPersonId);

  return (
    <Group>
      <Stack>
        {incoming.map((enrollment) => (
          <PersonBadge key={`#{enrollment.id}-in`} person={people[enrollment.person_id]} link />
        ))}
      </Stack>
      <Tooltip label={`${role.name} of`}>
        <IconArrowBigRight aria-label={`${role.name} of`} />
      </Tooltip>
      <div>you</div>
      <Tooltip label={`${role.name} of`}>
        <IconArrowBigRight aria-label={`${role.name} of`} />
      </Tooltip>
      <Stack>
        {outgoing.map((enrollment) => (
          <PersonBadge key={`#{enrollment.id}-out`} person={people[enrollment.peer_id]} link />
        ))}
      </Stack>
    </Group>
  );
}
