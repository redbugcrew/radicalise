import { ActionIcon, Group, Stack, Title } from "@mantine/core";
import { IntervalSelector } from "../components";
import { IconUserPlus } from "@tabler/icons-react";
import { Anchor } from "../components";
import { useAppSelector } from "../store";
import { useEffect, useState } from "react";
import type { Interval } from "../api/Api";
import PeopleForInterval from "./PeopleForInterval";

export default function People() {
  const intervals = useAppSelector((state) => state.intervals);

  const [currentInterval, setCurrentInterval] = useState<Interval | null>(null);
  useEffect(() => {
    if (intervals.currentInterval != currentInterval) {
      setCurrentInterval(intervals.currentInterval);
    }
  }, [intervals.currentInterval]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>People</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Person" size="lg">
            <IconUserPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <IntervalSelector intervals={intervals.allIntervals} currentInterval={currentInterval} onChangeInterval={setCurrentInterval} />
      {currentInterval && <PeopleForInterval interval={currentInterval} />}
    </Stack>
  );
}
