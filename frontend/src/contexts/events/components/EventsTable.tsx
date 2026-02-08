import { Stack, Table, Text } from "@mantine/core";
import { AttendanceIntention, type CalendarEvent, type CalendarEventAttendance } from "../../../api/Api";
import { Anchor, NoData } from "../../../components";
import type React from "react";
import { DateText } from "../../../components/TimeRangeText";
import { useState } from "react";
import { SearchField, SortableTh, sortData } from "../../../components/SortableTable/SortableTable";
import { format } from "date-fns";

interface EventsTableProps {
  events: CalendarEvent[];
  noDataMessage?: React.ReactNode;
}

function matchesFilter(item: CalendarEvent, lowerCaseQuery: string): boolean {
  return item.name.toLowerCase().includes(lowerCaseQuery) || searchableDateString(item.start_at).includes(lowerCaseQuery);
}

export default function EventsTable({ events, noDataMessage }: EventsTableProps) {
  if (events.length === 0) {
    return <NoData>{noDataMessage || "No events found"}</NoData>;
  }

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof CalendarEvent>("start_at");
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof CalendarEvent) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  let sortedEvents = sortData<CalendarEvent>(events, { sortBy: sortBy, reversed: reverseSortDirection, type_override: sortBy === "start_at" ? "string-date" : undefined, search: search }, matchesFilter);

  return (
    <Stack align="stretch">
      <SearchField value={search} onSearchChange={setSearch} />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <SortableTh sorted={sortBy == "start_at"} reversed={reverseSortDirection} onSort={() => setSorting("start_at")}>
              Date
            </SortableTh>
            <SortableTh sorted={sortBy == "name"} reversed={reverseSortDirection} onSort={() => setSorting("name")}>
              Name
            </SortableTh>
            <Table.Th ta="right">
              <Text visibleFrom="sm" span ta="right">
                Going
              </Text>
              <Text hiddenFrom="sm" span ta="right">
                Go
              </Text>
            </Table.Th>
            <Table.Th ta="right">
              <Text visibleFrom="sm" span ta="right">
                Apologies
              </Text>
              <Text hiddenFrom="sm" span ta="right">
                Ap
              </Text>
            </Table.Th>
            <Table.Th ta="right">
              <Text visibleFrom="sm" span ta="right">
                Attended
              </Text>
              <Text hiddenFrom="sm" span ta="right">
                At
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedEvents.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td maw="10em">
                <DateText date={event.start_at} />
              </Table.Td>
              <Table.Td>
                <Anchor href={`/events/${event.id}`}>{event.name}</Anchor>
              </Table.Td>
              <Table.Td maw="5em" align="right">
                {countIntentions(event.attendances, AttendanceIntention.Going)}
              </Table.Td>
              <Table.Td maw="5em" align="right">
                {countIntentions(event.attendances, AttendanceIntention.NotGoing)}
              </Table.Td>
              <Table.Td maw="5em" align="right">
                {countAttended(event.attendances)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function countIntentions(attendances: CalendarEventAttendance[] | undefined | null, intention: AttendanceIntention): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.intention === intention).length;
}

function countAttended(attendances: CalendarEventAttendance[] | undefined | null): number {
  if (!attendances) return 0;
  return attendances.filter((attendance) => attendance.actual === true).length;
}

function searchableDateString(date: string): string {
  return format(date, "MMMM d, yyyy").toLowerCase();
}
