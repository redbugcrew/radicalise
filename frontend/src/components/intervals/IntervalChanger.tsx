import { Card, Group, Stack, Text, Title } from "@mantine/core"
import type { Interval } from "../../api/Api"
import { formatDuration, intervalToDuration, type Duration, type FormatDurationOptions } from "date-fns"
import ActionButton from "../ActionButton"
import type { ActionPromiseResult } from "../ActionResult"

interface IntervalChangerProps {
  interval: Interval | null
  nextInterval?: Interval | null
  onNextInterval: () => Promise<ActionPromiseResult>
}

function absDuration(duration: Duration): Duration {
  const inverted: Duration = {}
  for (const [key, value] of Object.entries(duration)) {
    if (value !== undefined) {
      inverted[key as keyof Duration] = Math.abs(value)
    }
  }
  return inverted
}

export default function IntervalChanger({ interval, nextInterval, onNextInterval }: IntervalChangerProps) {
  const now = new Date()
  const endsInPast = interval?.end_date && new Date(interval.end_date) < now
  const durationOptions: FormatDurationOptions = { format: ["years", "months", "days", "hours"], delimiter: ", " }
  const duration =
    interval?.end_date &&
    intervalToDuration({
      start: now,
      end: interval.end_date,
    })

  return (
    <Card>
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Title order={2} size="md">
            {!interval ? (
              "No current interval"
            ) : (
              <>
                Current interval{" "}
                <Text span c="blue" fw={700}>
                  {interval.number}
                </Text>
              </>
            )}
          </Title>
          {interval && duration ? (
            endsInPast ? (
              <Text c="red">Was due to end {formatDuration(absDuration(duration), durationOptions)} ago</Text>
            ) : (
              <Text>Due to end in {formatDuration(duration, durationOptions)}</Text>
            )
          ) : (
            <Text>When you're ready, you can kick things off</Text>
          )}
        </Stack>
        {nextInterval && (
          <ActionButton color="blue" onClick={onNextInterval}>
            Start interval {nextInterval.number}
          </ActionButton>
        )}
      </Group>
    </Card>
  )
}
