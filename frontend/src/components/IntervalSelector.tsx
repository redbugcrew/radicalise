import { Group, ActionIcon, Text, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { DateInterval } from "../store/intervals";

interface IntervalSelectorProps {
  intervals: DateInterval[];
  current_interval: DateInterval | null;
}

export default function IntervalSelector(props: IntervalSelectorProps) {
  return (
    <Group justify="space-between">
      <ActionIcon variant="default" aria-label="Previous Page" size="lg">
        <IconChevronLeft style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
      <Stack align="center" justify="center" gap={0}>
        <Text span fw="bold" size="lg">
          Interval 10
        </Text>
        <Text span c="dimmed">
          12 June - 7th July
        </Text>
      </Stack>
      <ActionIcon variant="default" aria-label="Next Page" size="lg">
        <IconChevronRight style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
    </Group>
  );
}
