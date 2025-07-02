import { Container, Title, Text, Stack } from "@mantine/core";
import { IntervalForm } from "../../components";
import { useAppSelector } from "../../store";
import type { Interval } from "../../api/Api";

export default function NewInterval() {
  const intervals = useAppSelector((state) => state.intervals.allIntervals);
  const lastInterval = intervals[intervals.length - 1];

  // const defaultInterval: Interval = {
  //   id: lastInterval ? lastInterval.id + 1 : 1,
  // };

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Interval</Title>
        {lastInterval && <Text>Last Interval: {lastInterval.id}</Text>}
      </Stack>
      <IntervalForm />
    </Container>
  );
}
