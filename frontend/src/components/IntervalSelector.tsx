import { Group, ActionIcon, Text, Stack, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { DateOnly } from "@urbdyn/date-only";
import type { Interval } from "../api/Api";

interface IntervalSelectorProps {
  intervals: Interval[];
  selectedInterval: Interval | null;
  currentInterval?: Interval | null;
  onChangeInterval: (interval: Interval) => void;
}

function DateText({ date }: { date: DateOnly }) {
  const dateTime = new Date(date.year, date.month - 1, date.day);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const formattedDate = dateTime.toLocaleDateString("en-US", options);
  return <Text span>{formattedDate}</Text>;
}

interface IntervalNavigationButtonProps {
  variant: "previous" | "next";
  to: Interval | null;
  onChange: (interval: Interval) => void;
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

export default function IntervalSelector({ intervals, selectedInterval, currentInterval, onChangeInterval }: IntervalSelectorProps) {
  if (!selectedInterval) {
    return null;
  }

  const selectedntervalIndex = intervals.findIndex((interval) => interval.id === selectedInterval.id);
  const previousInterval = selectedntervalIndex > 0 ? intervals[selectedntervalIndex - 1] : null;
  const nextInterval = selectedntervalIndex < intervals.length - 1 ? intervals[selectedntervalIndex + 1] : null;

  return (
    <Group justify="space-between">
      <IntervalNavigationButton variant="previous" to={previousInterval} onChange={onChangeInterval} />
      <Stack align="center" justify="center" gap={0}>
        <Text span fw="bold" size="lg">
          Interval {selectedInterval.id}
        </Text>

        <Text span c="dimmed">
          <DateText date={DateOnly.fromString(selectedInterval.start_date)} /> - <DateText date={DateOnly.fromString(selectedInterval.end_date)} />
        </Text>
        {currentInterval && selectedInterval.id !== currentInterval.id && (
          <Button variant="filled" size="xs" onClick={() => onChangeInterval(currentInterval)} mt="md">
            Return to current
          </Button>
        )}
      </Stack>
      <IntervalNavigationButton variant="next" to={nextInterval} onChange={onChangeInterval} />
    </Group>
  );
}
