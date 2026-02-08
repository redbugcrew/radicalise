import { Table, Text } from "@mantine/core";
import { AttendanceIntention, type CalendarEvent, type CalendarEventAttendance } from "../../../api/Api";
import { Anchor, NoData } from "../../../components";
import type React from "react";
import { compareAsc } from "date-fns";
import { DateText } from "../../../components/TimeRangeText";

interface EventsTableProps {
  events: CalendarEvent[];
  noDataMessage?: React.ReactNode;
}

export default function EventsTable({ events, noDataMessage }: EventsTableProps) {
  if (events.length === 0) {
    return <NoData>{noDataMessage || "No events found"}</NoData>;
  }

  let sortedEvents = sortEventsByStartDate(events);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>
            <Text visibleFrom="sm">Going</Text>
            <Text hiddenFrom="sm">Go</Text>
          </Table.Th>
          <Table.Th>
            <Text visibleFrom="sm">Attended</Text>
            <Text hiddenFrom="sm">At</Text>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedEvents.map((event) => (
          <Table.Tr key={event.id}>
            <Table.Td>
              <DateText date={event.start_at} />
            </Table.Td>
            <Table.Td>
              <Anchor href={`/events/${event.id}`}>{event.name}</Anchor>
            </Table.Td>
            <Table.Td>{countGoingIntentions(event.attendances)}</Table.Td>
            <Table.Td>{countAttended(event.attendances)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

function sortEventsByStartDate(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => compareAsc(a.start_at, b.start_at));
}

function countGoingIntentions(attendances: CalendarEventAttendance[] | undefined | null): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.intention === AttendanceIntention.Going).length;
}

function countAttended(attendances: CalendarEventAttendance[] | undefined | null): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.actual === true).length;
}
