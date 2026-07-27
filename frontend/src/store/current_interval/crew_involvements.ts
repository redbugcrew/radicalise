import type { CrewInvolvement } from "../../api/Api";

export function forCrew(involvements: CrewInvolvement[], crewId: number): CrewInvolvement[] {
  return involvements.filter((involvement) => involvement.crew_id === crewId);
}

export function forPerson(involvements: CrewInvolvement[], personId: number): CrewInvolvement[] {
  return involvements.filter((involvement) => involvement.person_id === personId);
}

export function updatePersonCrewInvolvements(existing: CrewInvolvement[], newInvolvements: CrewInvolvement[], personId: number): CrewInvolvement[] {
  const toKeep = existing.filter((involvement) => involvement.person_id !== personId);
  const newForPerson = forPerson(newInvolvements, personId);

  return [...toKeep, ...newForPerson];
}
