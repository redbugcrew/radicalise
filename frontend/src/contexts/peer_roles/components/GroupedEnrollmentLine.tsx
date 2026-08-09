import { Group, Stack, Tooltip, Text } from "@mantine/core";
import type { PeerEnrollment, PeerRole } from "../../../api/Api";
import { PersonBadge } from "../../../components";
import { type PeopleObjectMap } from "../../../store/people";
import type { PersonBadgeProps } from "../../../components/people/PersonBadge/PersonBadge";
import { IconArrowRight, IconArrowBarBoth } from "@tabler/icons-react";

interface GroupedEnrollmentLineProps {
  enrollments: PeerEnrollment[];
  subjectPersonId: number;
  role: PeerRole;
  people: PeopleObjectMap;
  viewerPersonId?: number;
}

interface EnrollmentPersonBadgeProps extends PersonBadgeProps {
  viewerPersonId: number | undefined;
  subjectPersonId: number;
}

function EnrollmentPersonBadge({ person, viewerPersonId, subjectPersonId }: EnrollmentPersonBadgeProps) {
  const isYou = person?.id === viewerPersonId;

  return isYou ? <Text span>you</Text> : <PersonBadge person={person} link highlight={person?.id === subjectPersonId} />;
}

function isBirirectional(role: PeerRole): boolean {
  return ["RandomPairs", "RotatedPairs"].includes(role.distribution_type);
}

function singulariseRoleName(role: PeerRole): string {
  if (role.name.endsWith("s")) {
    return role.name.slice(0, -1);
  }
  return role.name;
}

function EnrollmentArrow({ role, bidirectional }: { role: PeerRole; bidirectional: boolean }) {
  if (bidirectional) {
    const label = `${role.name} with`.toLowerCase();
    return (
      <Tooltip label={label}>
        <IconArrowBarBoth aria-label={label} />
      </Tooltip>
    );
  } else {
    const label = `${singulariseRoleName(role)} to`.toLowerCase();
    return (
      <Tooltip label={label}>
        <IconArrowRight aria-label={label} />
      </Tooltip>
    );
  }
}

export default function GroupedEnrollmentLine({ enrollments, subjectPersonId, role, people, viewerPersonId }: GroupedEnrollmentLineProps) {
  const incoming = enrollments.filter((e) => e.peer_id == subjectPersonId);
  const outgoing = enrollments.filter((e) => e.person_id == subjectPersonId);
  const bidirectional = isBirirectional(role);

  return (
    <Group align="center">
      {!bidirectional && (
        <>
          <Stack>
            {incoming.map((enrollment) => (
              <EnrollmentPersonBadge key={`#{enrollment.id}-in`} person={people[enrollment.person_id]} link viewerPersonId={viewerPersonId} subjectPersonId={subjectPersonId} />
            ))}
          </Stack>

          <EnrollmentArrow role={role} bidirectional={bidirectional} />
        </>
      )}

      <EnrollmentPersonBadge key={`#{enrollment.id}-in`} person={people[subjectPersonId]} link viewerPersonId={viewerPersonId} subjectPersonId={subjectPersonId} />

      <EnrollmentArrow role={role} bidirectional={bidirectional} />

      <Stack>
        {outgoing.map((enrollment) => (
          <EnrollmentPersonBadge key={`#{enrollment.id}-out`} person={people[enrollment.peer_id]} link viewerPersonId={viewerPersonId} subjectPersonId={subjectPersonId} />
        ))}
      </Stack>
    </Group>
  );
}
