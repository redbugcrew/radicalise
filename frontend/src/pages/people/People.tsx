import { Group, Stack, Title } from "@mantine/core";
import { IntervalSelector } from "../../components";
import { useAppSelector } from "../../store";
import PeopleForInterval from "./PeopleForInterval";
import { useSelectedInterval } from "../intervals/WithIntervalInvolvements";

export default function People() {
  const intervals = useAppSelector((state) => state.intervals);
  const selectedInterval = useSelectedInterval();

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
      <IntervalSelector intervals={intervals.allIntervals} selectedInterval={selectedInterval} currentInterval={intervals.currentInterval} />
      {selectedInterval && <PeopleForInterval interval={selectedInterval} key={selectedInterval.id} />}
    </Stack>
  );
}
