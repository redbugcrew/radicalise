import { Stack, Title } from "@mantine/core";
import { useAppSelector } from "../store";
import { IntervalsTable } from "../components";

export default function Intervals() {
  const intervals = useAppSelector((state) => state.intervals.allIntervals);
  const currentIntervalId = useAppSelector((state) => state.intervals.currentInterval?.id || null);

  return (
    <Stack>
      <Title order={1}>Intervals</Title>
      <IntervalsTable intervals={intervals} currentIntervalId={currentIntervalId} />
    </Stack>
  );
}
