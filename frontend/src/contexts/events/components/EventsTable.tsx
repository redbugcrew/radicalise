import { Table, Text } from "@mantine/core";
import { AttendanceIntention, type CalendarEvent, type CalendarEventAttendance } from "../../../api/Api";
import { Anchor, NoData } from "../../../components";
import type React from "react";
import { DateText } from "../../../components/TimeRangeText";
import { useState } from "react";
import { SortableTh, sortData } from "../../../components/SortableTable/SortableTable";

interface EventsTableProps {
  events: CalendarEvent[];
  noDataMessage?: React.ReactNode;
}

function matchesFilter(_item: CalendarEvent, _query: string): boolean {
  return true;
}

export default function EventsTable({ events, noDataMessage }: EventsTableProps) {
  if (events.length === 0) {
    return <NoData>{noDataMessage || "No events found"}</NoData>;
  }

  const [sortBy, setSortBy] = useState<keyof CalendarEvent>("start_at");
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof CalendarEvent) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  // let sortedEvents = sortEventsByStartDate(events);
  let sortedEvents = sortData<CalendarEvent>(events, { sortBy: sortBy, reversed: reverseSortDirection, type_override: sortBy === "start_at" ? "string-date" : undefined, search: "" }, matchesFilter);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <SortableTh sorted={sortBy == "start_at"} reversed={reverseSortDirection} onSort={() => setSorting("start_at")}>
            Date
          </SortableTh>
          <SortableTh sorted={sortBy == "name"} reversed={reverseSortDirection} onSort={() => setSorting("name")}>
            Name
          </SortableTh>
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

function countGoingIntentions(attendances: CalendarEventAttendance[] | undefined | null): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.intention === AttendanceIntention.Going).length;
}

function countAttended(attendances: CalendarEventAttendance[] | undefined | null): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.actual === true).length;
}
