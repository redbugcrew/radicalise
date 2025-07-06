import { Container, Title, Text, Stack, Card, Group } from "@mantine/core";
import { IntervalForm } from "../../components";
import { useAppSelector } from "../../store";
import DateText from "../../components/DateText";
import { lastIntervalToInput } from "../../components/intervals/IntervalForm";
import type { Iso } from "iso-fns";

export default function NewInterval() {
  const intervals = useAppSelector((state) => state.intervals.allIntervals);
  const lastInterval = intervals.length > 0 ? intervals[intervals.length - 1] : null;

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Interval</Title>

        {lastInterval && (
          <Group>
            <Card withBorder bg="dark">
              <Title order={2} size="md">
                Last interval #{lastInterval.id}
              </Title>
              <Text>
                <DateText date={lastInterval.start_date} /> - <DateText date={lastInterval.end_date} />
              </Text>
            </Card>
          </Group>
        )}
      </Stack>
      <IntervalForm value={lastIntervalToInput(lastInterval)} minDate={(lastInterval?.end_date as Iso.Date) || null} />
    </Container>
  );
}
