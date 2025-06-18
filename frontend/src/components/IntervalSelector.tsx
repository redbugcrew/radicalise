import { Group, ActionIcon, Text, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { DateInterval } from "../store/intervals";
import type { DateOnly } from "@urbdyn/date-only";

interface IntervalSelectorProps {
  intervals: DateInterval[];
  current_interval: DateInterval | null;
}

function DateText({ date }: { date: DateOnly }) {
  const dateTime = new Date(date.year, date.month, date.day);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const formattedDate = dateTime.toLocaleDateString("en-US", options);
  return <Text span>{formattedDate}</Text>;
}

export default function IntervalSelector({ intervals, current_interval }: IntervalSelectorProps) {
  if (!current_interval) {
    return null;
  }

  return (
    <Group justify="space-between">
      <ActionIcon variant="default" aria-label="Previous Page" size="lg">
        <IconChevronLeft style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
      <Stack align="center" justify="center" gap={0}>
        <Text span fw="bold" size="lg">
          Interval {current_interval.id}
        </Text>
        <Text span c="dimmed">
          <DateText date={current_interval.start_date} /> - <DateText date={current_interval.end_date} />
        </Text>
      </Stack>
      <ActionIcon variant="default" aria-label="Next Page" size="lg">
        <IconChevronRight style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
    </Group>
  );
}
