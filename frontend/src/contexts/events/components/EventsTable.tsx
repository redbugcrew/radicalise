import { Stack, Table } from "@mantine/core";
import { AttendanceIntention, type CalendarEvent, type CalendarEventAttendance } from "../../../api/Api";
import { Anchor, NoData } from "../../../components";
import React from "react";
import { DateText } from "../../../components/TimeRangeText";
import { useState } from "react";
import { SearchField, SortableTh, sortData, Th } from "../../../components/SortableTable/SortableTable";
import { format } from "date-fns";
import { useAppSelector } from "../../../store";
import { IconCheck, IconCircleCheck, IconCircleDashedCheck, IconCircleDashedX, IconCircleX } from "@tabler/icons-react";

interface EventsTableProps {
  events: CalendarEvent[];
  noDataMessage?: React.ReactNode;
}

function matchesFilter(item: CalendarEvent, lowerCaseQuery: string): boolean {
  return item.name.toLowerCase().includes(lowerCaseQuery) || searchableDateString(item.start_at).includes(lowerCaseQuery);
}

export default function EventsTable({ events, noDataMessage }: EventsTableProps) {
  const currentPersonId = useAppSelector((state) => state.me?.person_id);

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
            {currentPersonId && <Th right>You</Th>}
            <Th right abbreviated="Go">
              Going
            </Th>
            <Th right abbreviated="Ap">
              Apologies
            </Th>
            <Th right abbreviated="At">
              Attended
            </Th>
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
              {currentPersonId && (
                <Table.Td maw="5em" align="right">
                  {attendanceIcon(personAttendance(event, currentPersonId))}
                </Table.Td>
              )}
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

function attendanceIcon(attendance: CalendarEventAttendance | undefined): React.ReactNode {
  const intention = attendance?.intention;
  const actual = attendance?.actual;

  const setIntention: boolean = intention === AttendanceIntention.Going || intention === AttendanceIntention.NotGoing;
  const metIntention = (intention === AttendanceIntention.Going && actual === true) || (intention === AttendanceIntention.NotGoing && actual === false);
  const went = actual === true;

  if (went) {
    if (setIntention) {
      if (metIntention) {
        return <IconCircleCheck color="green" />;
      } else {
        return <IconCircleDashedCheck color="green" />;
      }
    } else {
      return <IconCheck color="green" />;
    }
  } else {
    if (setIntention) {
      if (metIntention) {
        return <IconCircleX color="orange" />;
      } else {
        return <IconCircleDashedX color="red" />;
      }
    } else {
      return null;
    }
  }

  return null;
}

function personAttendance(event: CalendarEvent, personId: number): CalendarEventAttendance | undefined {
  return event.attendances?.find((attendance) => attendance.person_id === personId);
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
