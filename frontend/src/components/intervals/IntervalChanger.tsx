import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { Interval } from "../../api/Api";
import { formatDuration, intervalToDuration, type Duration, type FormatDurationOptions } from "date-fns";

interface IntervalChangerProps {
  interval: Interval | null;
  nextInterval?: Interval | null;
}

function absDuration(duration: Duration): Duration {
  const inverted: Duration = {};
  for (const [key, value] of Object.entries(duration)) {
    if (value !== undefined) {
      inverted[key as keyof Duration] = Math.abs(value);
    }
  }
  return inverted;
}

export default function IntervalChanger({ interval, nextInterval }: IntervalChangerProps) {
  if (!interval) return null;

  const now = new Date();
  const duration = intervalToDuration({
    start: now,
    end: interval.end_date,
  });
  const endsInPast = new Date(interval.end_date) < now;
  const durationOptions: FormatDurationOptions = { format: ["years", "months", "days", "hours"], delimiter: ", " };

  return (
    <Card>
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Title order={2} size="md">
            Current interval{" "}
            <Text span c="blue" fw={700}>
              {interval.id}
            </Text>
          </Title>
          {endsInPast ? <Text c="red">Was due to end {formatDuration(absDuration(duration), durationOptions)} ago</Text> : <Text>Due to end in {formatDuration(duration, durationOptions)}</Text>}
        </Stack>
        {nextInterval && <Button color="blue">Start interval {nextInterval.id}</Button>}
      </Group>
    </Card>
  );
}
