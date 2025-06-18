import { Group, ActionIcon, Text, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { DateInterval } from "../store/intervals";
import type { DateOnly } from "@urbdyn/date-only";

interface IntervalSelectorProps {
  intervals: DateInterval[];
  currentInterval: DateInterval | null;
  onChangeInterval: (interval: DateInterval) => void;
}

function DateText({ date }: { date: DateOnly }) {
  const dateTime = new Date(date.year, date.month, date.day);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const formattedDate = dateTime.toLocaleDateString("en-US", options);
  return <Text span>{formattedDate}</Text>;
}

interface IntervalNavigationButtonProps {
  variant: "previous" | "next";
  to: DateInterval | null;
  onChange: (interval: DateInterval) => void;
}

function IntervalNavigationButton({ variant, to, onChange }: IntervalNavigationButtonProps) {
  const IconComponent = variant === "previous" ? IconChevronLeft : IconChevronRight;
  const disabled = !to;
  const label = variant === "previous" ? "Previous Interval" : "Next Interval";
  const onClick = () => {
    if (to) onChange(to);
  };

  return (
    <ActionIcon variant="default" data-disabled={disabled} aria-label={label} size="lg" onClick={disabled ? undefined : onClick}>
      <IconComponent style={{ width: "70%", height: "70%" }} />
    </ActionIcon>
  );
}

export default function IntervalSelector({ intervals, currentInterval, onChangeInterval }: IntervalSelectorProps) {
  if (!currentInterval) {
    return null;
  }

  const currentIntervalIndex = intervals.findIndex((interval) => interval.id === currentInterval.id);
  const previousInterval = currentIntervalIndex > 0 ? intervals[currentIntervalIndex - 1] : null;
  const nextInterval = currentIntervalIndex < intervals.length - 1 ? intervals[currentIntervalIndex + 1] : null;

  return (
    <Group justify="space-between">
      <IntervalNavigationButton variant="previous" to={previousInterval} onChange={onChangeInterval} />
      <Stack align="center" justify="center" gap={0}>
        <Text span fw="bold" size="lg">
          Interval {currentInterval.id}
        </Text>
        <Text span c="dimmed">
          <DateText date={currentInterval.start_date} /> - <DateText date={currentInterval.end_date} />
        </Text>
      </Stack>
      <IntervalNavigationButton variant="next" to={nextInterval} onChange={onChangeInterval} />
    </Group>
  );
}
