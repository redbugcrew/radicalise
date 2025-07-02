import { Table } from "@mantine/core";
import type { Interval } from "../api/Api";
import DateText from "./DateText";
import { dateStringToDateTime } from "../utilities/date";
import { differenceInDays } from "date-fns";

interface IntervalsTableProps {
  intervals: Interval[];
  currentIntervalId: number | null;
}

function IntervalTableRow({ interval, isCurrent }: { interval: Interval; isCurrent: boolean }) {
  if (!interval) return null;

  const stateDate = dateStringToDateTime(interval.start_date);
  const endDate = dateStringToDateTime(interval.end_date);
  let duration = null;

  if (stateDate && endDate) {
    duration = differenceInDays(endDate, stateDate);
  }

  return (
    <Table.Tr key={interval.id} style={{ boxShadow: isCurrent ? "-3px 0 0 0 var(--mantine-color-blue-5)" : undefined }}>
      <Table.Td>{interval.id}</Table.Td>
      <Table.Td>
        <DateText date={interval.start_date} />
      </Table.Td>
      <Table.Td>
        <DateText date={interval.end_date} />
      </Table.Td>
      <Table.Td>{duration}</Table.Td>
    </Table.Tr>
  );
}

export default function IntervalsTable({ intervals, currentIntervalId }: IntervalsTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>#</Table.Th>
          <Table.Th>Start</Table.Th>
          <Table.Th>End</Table.Th>
          <Table.Th>Days</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {intervals.map((interval) => (
          <IntervalTableRow key={interval.id} interval={interval} isCurrent={currentIntervalId === interval.id} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
