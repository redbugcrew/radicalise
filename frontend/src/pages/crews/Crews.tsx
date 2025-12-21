import { Stack, Title } from "@mantine/core";
import CrewsForInterval from "./CrewsForInterval";
import { IntervalSelector } from "../../components";
import { useEffect, useState } from "react";
import type { Interval } from "../../api/Api";
import { useAppSelector } from "../../store";

export default function Crews() {
  const intervals = useAppSelector((state) => state.intervals);
  const [selectedInterval, setSelectedInterval] = useState<Interval | null>(null);
  useEffect(() => {
    if (intervals.currentInterval != selectedInterval) {
      setSelectedInterval(intervals.currentInterval);
    }
  }, [intervals.currentInterval]);

  return (
    <Stack>
      <Title order={1}>Crews</Title>
      <IntervalSelector intervals={intervals.allIntervals} selectedInterval={selectedInterval} currentInterval={intervals.currentInterval} onChangeInterval={setSelectedInterval} />

      {selectedInterval && <CrewsForInterval interval={selectedInterval} key={selectedInterval.id} />}
    </Stack>
  );
}
