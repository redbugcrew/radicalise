import { Container, Title, Text, Stack, Card, Group } from "@mantine/core";
import { IntervalForm } from "../../components";
import { handleIntervalsEvents, useAppSelector } from "../../store";
import DateText from "../../components/DateText";
import { lastIntervalToInput } from "../../components/intervals/IntervalForm";
import type { Iso } from "iso-fns";
import type { Interval } from "../../api/Api";
import { getApi } from "../../api";
import { useNavigate } from "react-router-dom";

export default function NewInterval() {
  const intervals = useAppSelector((state) => state.intervals.allIntervals);
  const navigate = useNavigate();
  const lastInterval = intervals.length > 0 ? intervals[intervals.length - 1] : null;

  const onSubmit = (interval: Interval) => {
    const api = getApi();
    api.api.createInterval(interval).then((response) => {
      if (response.status === 201) {
        handleIntervalsEvents(response.data);
        navigate("/intervals");
      } else {
        console.error("Failed to create interval:", response);
      }
    });
  };

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
      <IntervalForm value={lastIntervalToInput(lastInterval)} minDate={(lastInterval?.end_date as Iso.Date) || null} onSubmit={onSubmit} />
    </Container>
  );
}
