import { Table } from "@mantine/core";
import type { CalendarEvent, CalendarEventAttendance, Person } from "../../../api/Api";
import { useAppSelector } from "../../../store";
import { PersonBadge } from "../../../components";
import PersonEventAttendanceIcon from "./AttendanceIcon";
import { isFuture } from "date-fns";

export default function EventAttendeeTable({ event }: { event: CalendarEvent }) {
  let people = useAppSelector((state) => state.people);
  let mePersonId = useAppSelector((state) => state.me?.person_id);
  let attendances: CalendarEventAttendance[] = event.attendances || [];
  let inFuture = isFuture(event.start_at);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Person</Table.Th>
          <Table.Th>Intention</Table.Th>
          {!inFuture && <Table.Th>Attendance</Table.Th>}
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {attendances.map((attendance) => {
          const person: Person | undefined = people[attendance.person_id];

          return (
            <Table.Tr key={attendance.id}>
              <Table.Td w={1}>{person ? <PersonBadge person={person} me={mePersonId === person.id} /> : "Unknown"}</Table.Td>
              <Table.Td>{attendance.intention && toTitleCase(attendance.intention)}</Table.Td>
              {!inFuture && <Table.Td>{attendance.actual === null ? "Unknown" : attendance.actual ? "Attended" : "Did not attend"}</Table.Td>}
              <Table.Td align="right">{<PersonEventAttendanceIcon attendance={attendance} inFuture={isFuture(event.start_at)} />}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

const toTitleCase = (str: string) => {
  return str.replace(/([A-Z])/g, " $1").trim();
};
