import { Table } from "@mantine/core"
import type { Interval } from "../../api/Api"
import DateText from "./../DateText"
import { dateStringToDateTime } from "../../utilities/date"
import { differenceInDays } from "date-fns"

interface IntervalsTableProps {
  intervals: Interval[]
  currentIntervalNumber: number | null
}

function IntervalTableRow({ interval, isCurrent }: { interval: Interval; isCurrent: boolean }) {
  if (!interval) return null

  const stateDate = dateStringToDateTime(interval.start_date)
  const endDate = interval.end_date ? dateStringToDateTime(interval.end_date) : null
  let duration = null

  if (stateDate && endDate) {
    duration = differenceInDays(endDate, stateDate)
  }

  return (
    <Table.Tr key={interval.number} style={{ boxShadow: isCurrent ? "-3px 0 0 0 var(--mantine-color-blue-5)" : undefined }}>
      <Table.Td>{interval.number}</Table.Td>
      <Table.Td>
        <DateText date={interval.start_date} />
      </Table.Td>
      <Table.Td>
        <DateText date={interval.end_date} />
      </Table.Td>
      <Table.Td>{duration}</Table.Td>
    </Table.Tr>
  )
}

export default function IntervalsTable({ intervals, currentIntervalNumber }: IntervalsTableProps) {
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
          <IntervalTableRow key={interval.number} interval={interval} isCurrent={currentIntervalNumber === interval.number} />
        ))}
      </Table.Tbody>
    </Table>
  )
}
