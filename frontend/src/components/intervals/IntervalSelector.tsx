import { Group, ActionIcon, Text, Stack, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Interval } from "../../api/Api";
import DateText from "./../DateText";
import { useNavigate } from "react-router-dom";

interface IntervalSelectorProps {
  intervals: Interval[];
  selectedInterval: Interval | null;
  currentInterval?: Interval | null;
}

interface IntervalNavigationButtonProps {
  variant: "previous" | "next";
  to: Interval | null;
}

function IntervalNavigationButton({ variant, to }: IntervalNavigationButtonProps) {
  const navigate = useNavigate();
  const IconComponent = variant === "previous" ? IconChevronLeft : IconChevronRight;
  const disabled = !to;
  const label = variant === "previous" ? "Previous Interval" : "Next Interval";
  const onClick = () => {
    navigate({
      hash: to ? `#interval${to.id}` : "",
    });
  };

  return (
    <ActionIcon variant="default" data-disabled={disabled} aria-label={label} size="lg" onClick={disabled ? undefined : onClick}>
      <IconComponent style={{ width: "70%", height: "70%" }} />
    </ActionIcon>
  );
}

function ReturnToCurrentButton() {
  const navigate = useNavigate();
  const onClick = () => {
    navigate({
      hash: "",
    });
  };
  return (
    <Button variant="filled" size="xs" onClick={onClick} mt="md">
      Return to current
    </Button>
  );
}

export default function IntervalSelector({ intervals, selectedInterval, currentInterval }: IntervalSelectorProps) {
  if (!selectedInterval) {
    return null;
  }

  const selectedntervalIndex = intervals.findIndex((interval) => interval.id === selectedInterval.id);
  const previousInterval = selectedntervalIndex > 0 ? intervals[selectedntervalIndex - 1] : null;
  const nextInterval = selectedntervalIndex < intervals.length - 1 ? intervals[selectedntervalIndex + 1] : null;

  return (
    <Group justify="space-between">
      <IntervalNavigationButton variant="previous" to={previousInterval} />
      <Stack align="center" justify="center" gap={0}>
        <Text span fw="bold" size="lg">
          Interval {selectedInterval.id}
        </Text>

        <Text span c="dimmed">
          <DateText date={selectedInterval.start_date} /> - <DateText date={selectedInterval.end_date} />
        </Text>
        {currentInterval && selectedInterval.id !== currentInterval.id && <ReturnToCurrentButton />}
      </Stack>
      <IntervalNavigationButton variant="next" to={nextInterval} />
    </Group>
  );
}
