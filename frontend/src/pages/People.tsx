import { ActionIcon, Group, Stack, Tabs, Title } from "@mantine/core";
import { IntervalSelector, PeopleTable } from "../components";
import { IconUserPlus } from "@tabler/icons-react";
import { Anchor } from "../components";
import { useAppSelector } from "../store";
import type { DateInterval } from "../store/intervals";
import { useEffect, useState } from "react";

export default function People() {
  const intervals = useAppSelector((state) => state.intervals);

  const [currentInterval, setCurrentInterval] = useState<DateInterval | null>(null);
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
      <Tabs defaultValue="participants">
        <Tabs.List>
          <Tabs.Tab value="participants">Participants</Tabs.Tab>
          <Tabs.Tab value="supporters">Supporters</Tabs.Tab>
          <Tabs.Tab value="archived">Archived</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="participants" pt="md">
          <PeopleTable />
        </Tabs.Panel>

        <Tabs.Panel value="supporters" pt="md">
          Supporters tab content
        </Tabs.Panel>

        <Tabs.Panel value="archived" pt="md">
          Archived tab content
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
