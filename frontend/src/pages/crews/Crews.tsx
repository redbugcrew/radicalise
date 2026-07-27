import { Stack, Title } from "@mantine/core";
import CrewsForInterval from "./CrewsForInterval";
import { IntervalSelector } from "../../components";
import { useAppSelector } from "../../store";
import { useSelectedInterval } from "../intervals/WithIntervalData";
import { useCurrentInterval } from "../../store/current_interval";

export default function Crews() {
  const intervals = useAppSelector((state) => state.intervals);
  const selectedInterval = useSelectedInterval();
  const currentInterval = useCurrentInterval();

  return (
    <Stack>
      <Title order={1}>Crews</Title>
      <IntervalSelector intervals={intervals.allIntervals} selectedInterval={selectedInterval} currentInterval={currentInterval} />

      {selectedInterval && <CrewsForInterval interval={selectedInterval} key={selectedInterval.id} />}
    </Stack>
  );
}
