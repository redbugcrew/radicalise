import { Group, Stack, Title } from "@mantine/core";
import { IntervalSelector } from "../components";
import { useAppSelector } from "../store";
import { useEffect, useState } from "react";
import type { Interval } from "../api/Api";
import PeopleForInterval from "./PeopleForInterval";

export default function People() {
  const intervals = useAppSelector((state) => state.intervals);

  const [selectedInterval, setSelectedInterval] = useState<Interval | null>(null);
  useEffect(() => {
    if (intervals.currentInterval != selectedInterval) {
      setSelectedInterval(intervals.currentInterval);
    }
  }, [intervals.currentInterval]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>People</Title>
        {/* <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Person" size="lg">
            <IconUserPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor> */}
      </Group>
      <IntervalSelector intervals={intervals.allIntervals} selectedInterval={selectedInterval} currentInterval={intervals.currentInterval} onChangeInterval={setSelectedInterval} />
      {selectedInterval && <PeopleForInterval interval={selectedInterval} />}
    </Stack>
  );
}
