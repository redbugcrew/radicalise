import { ActionIcon, Group, Stack, Title } from "@mantine/core";
import { useAppSelector } from "../../store";
import { Anchor, IntervalsTable } from "../../components";
import { IconCalendarPlus } from "@tabler/icons-react";

export default function Intervals() {
  const intervals = useAppSelector((state) => state.intervals.allIntervals);
  const currentIntervalId = useAppSelector((state) => state.intervals.currentInterval?.id || null);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Intervals</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Interval" size="lg">
            <IconCalendarPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <IntervalsTable intervals={intervals} currentIntervalId={currentIntervalId} />
    </Stack>
  );
}
