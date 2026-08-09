import { Stack, Text } from "@mantine/core";
import type { PeerEnrollment, PeerRole } from "../../../api/Api";
import type { PeerRolesObjectMap } from "../../../store/peer_roles";
import type { PeopleObjectMap } from "../../../store/people";

import classes from "./Enrollments.module.css";
import GroupedEnrollmentLine from "./GroupedEnrollmentLine";

interface GroupedEnrollmentsProps {
  enrollments: PeerEnrollment[];
  subjectPersonId: number;
  viewerPersonId?: number | undefined;
  roles: PeerRolesObjectMap;
  people: PeopleObjectMap;
}

interface RoleWithEnrollments {
  role: PeerRole;
  enrollments: PeerEnrollment[];
}

interface EnrollmentsMappedByRoleId {
  [key: number]: PeerEnrollment[];
}

function groupByRole(enrollments: PeerEnrollment[], roles: PeerRolesObjectMap): RoleWithEnrollments[] {
  const mappedResult = enrollments.reduce<EnrollmentsMappedByRoleId>((result, enrollment) => {
    result[enrollment.peer_role_id] ||= [];
    result[enrollment.peer_role_id].push(enrollment);
    return result;
  }, {} as EnrollmentsMappedByRoleId);

  const unordered = Object.keys(mappedResult).map((roleIdString) => {
    const roleId = Number(roleIdString);
    const role = roles[roleId];
    const enrollments = mappedResult[roleId];
    return { role, enrollments };
  });

  return unordered.sort((a, b) => a.role.id - b.role.id);
}

export default function GroupedEnrollments({ enrollments, subjectPersonId, viewerPersonId, roles, people }: GroupedEnrollmentsProps) {
  if (enrollments.length === 0) return null;

  const grouped = groupByRole(enrollments, roles);
  console.log("grouped", grouped);

  return (
    <div className={classes.multiple_roles}>
      {grouped.map(({ role, enrollments }) => (
        <>
          <Text fw="bold" pt={3}>
            {role.name}
          </Text>
          <Stack gap="sm">
            <GroupedEnrollmentLine enrollments={enrollments} subjectPersonId={subjectPersonId} role={role} people={people} viewerPersonId={viewerPersonId} />
          </Stack>
        </>
      ))}
    </div>
  );
}
