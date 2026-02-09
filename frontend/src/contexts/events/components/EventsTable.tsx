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

interface CalendarEventRowData {
  id: number;
  start_at: string;
  name: string;
  yourAttendance: CalendarEventAttendance | undefined;
  going: number;
  notGoing: number;
  attended: number;
}

type SortableEventField = keyof CalendarEventRowData;

function matchesFilter(item: CalendarEventRowData, lowerCaseQuery: string): boolean {
  return item.name.toLowerCase().includes(lowerCaseQuery) || searchableDateString(item.start_at).includes(lowerCaseQuery);
}

export default function EventsTable({ events, noDataMessage }: EventsTableProps) {
  const currentPersonId = useAppSelector((state) => state.me?.person_id);

  if (events.length === 0) {
    return <NoData>{noDataMessage || "No events found"}</NoData>;
  }

  const rowData: CalendarEventRowData[] = buildAllRowData(events, currentPersonId);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortableEventField>("start_at");
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: SortableEventField) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  let sortedRowData = sortData<CalendarEventRowData>(
    rowData,
    { sortBy: sortBy, reversed: reverseSortDirection, type_override: sortBy === "start_at" ? "string-date" : undefined, compare_override: sortBy === "yourAttendance" ? compareAttendances : null, search: search },
    matchesFilter,
  );

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
            {currentPersonId && (
              <SortableTh right sorted={sortBy == "yourAttendance"} reversed={reverseSortDirection} onSort={() => setSorting("yourAttendance")}>
                You
              </SortableTh>
            )}
            <SortableTh right abbreviated="Go" sorted={sortBy == "going"} reversed={reverseSortDirection} onSort={() => setSorting("going")}>
              Going
            </SortableTh>
            <SortableTh right abbreviated="Ap" sorted={sortBy == "notGoing"} reversed={reverseSortDirection} onSort={() => setSorting("notGoing")}>
              Apologies
            </SortableTh>
            <SortableTh right abbreviated="At" sorted={sortBy == "attended"} reversed={reverseSortDirection} onSort={() => setSorting("attended")}>
              Attended
            </SortableTh>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedRowData.map((row) => (
            <Table.Tr key={row.id}>
              <Table.Td maw="10em">
                <DateText date={row.start_at} />
              </Table.Td>
              <Table.Td>
                <Anchor href={`/events/${row.id}`}>{row.name}</Anchor>
              </Table.Td>
              {currentPersonId && (
                <Table.Td maw="5em" align="right">
                  {attendanceIcon(row.yourAttendance)}
                </Table.Td>
              )}
              <Table.Td maw="5em" align="right">
                {row.going}
              </Table.Td>
              <Table.Td maw="5em" align="right">
                {row.notGoing}
              </Table.Td>
              <Table.Td maw="5em" align="right">
                {row.attended}
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

function buildAllRowData(events: CalendarEvent[], currentPersonId: number | null | undefined): CalendarEventRowData[] {
  return events.map((event) => buildRowData(event, currentPersonId));
}

function buildRowData(event: CalendarEvent, currentPersonId: number | null | undefined): CalendarEventRowData {
  return {
    id: event.id,
    start_at: event.start_at,
    name: event.name,
    yourAttendance: currentPersonId ? personAttendance(event, currentPersonId) : undefined,
    going: countIntentions(event.attendances, AttendanceIntention.Going),
    notGoing: countIntentions(event.attendances, AttendanceIntention.NotGoing),
    attended: countAttended(event.attendances),
  };
}

function compareAttendances(a: CalendarEventAttendance | undefined, b: CalendarEventAttendance | undefined): number {
  return compareBools(a?.actual, b?.actual);
}

function compareBools(a: boolean | undefined | null, b: boolean | undefined | null): number {
  const asAsInt = a ? 1 : 0;
  const bsAsInt = b ? 1 : 0;
  return bsAsInt - asAsInt;
}
