import { ActionIcon, Group, Stack, Title } from "@mantine/core";
import { handleAppEvents, useAppSelector } from "../../store";
import { Anchor, IntervalsTable } from "../../components";
import { IconCalendarPlus } from "@tabler/icons-react";
import IntervalChanger from "../../components/intervals/IntervalChanger";
import { useNextInterval } from "../../store/intervals";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../components/ActionResult";
import { getApi } from "../../api";

export default function Intervals() {
  const intervals = useAppSelector((state) => state.intervals.allIntervals);
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const nextInterval = useNextInterval();

  const onNextInterval = async (): Promise<ActionPromiseResult> => {
    return getApi()
      .api.startNextInterval()
      .then((response) => {
        handleAppEvents(response.data);
        return actionSuccess();
      })
      .catch((error) => {
        return actionFailure(error);
      });
  };

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

      <IntervalChanger interval={currentInterval} nextInterval={nextInterval} onNextInterval={onNextInterval} />

      <IntervalsTable intervals={intervals} currentIntervalId={currentInterval?.id || null} />
    </Stack>
  );
}
