import { Table } from "@mantine/core";
import { AttendanceIntention, type CalendarEvent, type CalendarEventAttendance } from "../../../api/Api";

export default function EventAttendanceTotals({ event }: { event: CalendarEvent }) {
  return (
    <Table width="auto">
      <Table.Thead>
        <Table.Tr>
          <Table.Td>Going</Table.Td>
          <Table.Td>Uncertain</Table.Td>
          <Table.Td>Not Going</Table.Td>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>{countIntentions(event.attendances, AttendanceIntention.Going)}</Table.Td>
          <Table.Td>{countIntentions(event.attendances, AttendanceIntention.Uncertain)}</Table.Td>
          <Table.Td>{countIntentions(event.attendances, AttendanceIntention.NotGoing)}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}

function countIntentions(attendances: CalendarEventAttendance[] | undefined | null, intention: AttendanceIntention): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.intention === intention).length;
}
