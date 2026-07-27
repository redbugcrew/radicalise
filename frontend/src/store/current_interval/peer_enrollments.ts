import type { PeerEnrollment } from "../../api/Api";

export function involvingPerson(enrollments: PeerEnrollment[], personId: number): PeerEnrollment[] {
  return enrollments.filter((enrollment) => enrollment.person_id === personId || enrollment.peer_id === personId);
}

export function initiatingFromPerson(enrollments: PeerEnrollment[], personId: number): PeerEnrollment[] {
  return enrollments.filter((enrollment) => enrollment.person_id === personId);
}
