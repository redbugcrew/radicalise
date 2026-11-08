import { useForm } from "@mantine/form"
import { Button, Group, Select, Stack, Text } from "@mantine/core"
import { CrewStatus, type Interval, type UpdateCrewStatusRequest } from "../../../api/Api"
import CrewStatusBadge from "./CrewStatusBadge"

interface CrewStatusFormProps {
  intervals: Interval[]
  currentIntervalNumber: number
  onSubmit: (values: UpdateCrewStatusRequest) => void
}

interface CrewStatusFormData {
  interval_number?: string
  new_status?: CrewStatus
}

function defaultValue(intervals: Interval[]): CrewStatusFormData {
  return {
    interval_number: intervals.length == 1 ? intervals[0].number.toString() : undefined,
    new_status: undefined,
  }
}

function parseIntervalNumber(value?: string): number | null {
  const intervalNumber = value ? parseInt(value) : null
  return intervalNumber === null || isNaN(intervalNumber) ? null : intervalNumber
}

function existingStatus(intervalNumber: number | null, statusMap: Record<number, CrewStatus>): CrewStatus | null {
  return intervalNumber === null ? null : statusMap[intervalNumber] || null
}

export default function CreateStatusForm({ intervals, currentIntervalNumber, onSubmit }: CrewStatusFormProps) {
  const form = useForm<CrewStatusFormData>({
    mode: "controlled",
    initialValues: defaultValue(intervals),
    validate: {
      interval_number: (value) => (value ? null : "Interval is required"),
      new_status: (value) => (value ? null : "New status is required"),
    },
  })

  const onSubmitForm = (values: CrewStatusFormData) => {
    const intervalNumber = parseIntervalNumber(values.interval_number)
    if (intervalNumber === null) return

    const new_status = values.new_status
    if (!new_status) return

    onSubmit({
      interval_number: intervalNumber,
      new_status: new_status,
    })
  }

  const statusValues = Object.values(CrewStatus)

  const intervalLabel = (interval: Interval) => {
    let suffix = ""
    if (interval.number === currentIntervalNumber) {
      suffix = " (Current)"
    } else if (interval.number === currentIntervalNumber + 1) {
      suffix = " (Next)"
    }
    return `Interval ${interval.number}${suffix}`
  }

  return (
    <form onSubmit={form.onSubmit(onSubmitForm)}>
      <Stack gap="lg">
        <Stack gap="md">
          <Select
            label="Start From"
            placeholder="Select an interval to apply this change from, going forwards"
            key="interval_number"
            required
            data={intervals.map((interval) => ({ value: interval.number.toString(), label: intervalLabel(interval) }))}
            {...form.getInputProps("interval_number")}
          />

          <Select
            label="New Status"
            placeholder="Select the new status"
            key="new_status"
            required
            data={statusValues.map((status) => ({ value: status, label: status }))}
            {...form.getInputProps("new_status")}
          />
        </Stack>
        <Button type="submit">Update</Button>
      </Stack>
    </form>
  )
}
