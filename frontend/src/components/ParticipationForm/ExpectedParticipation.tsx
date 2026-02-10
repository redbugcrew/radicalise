import { Stack, Title, Text } from "@mantine/core";
import { EventResponseExpectation, type Interval } from "../../api/Api";
import EventsList from "../../contexts/events/components/EventsList";
import { useAppSelector } from "../../store";
import { occurInInterval, withResponseExpection } from "../../store/events";

interface ExpectedParticipationProps {
  interval: Interval;
}

export default function ExpectedParticipation({ interval }: ExpectedParticipationProps) {
  const expectations = [EventResponseExpectation.Expected];
  const events = useAppSelector((state) => withResponseExpection(occurInInterval(state.events, interval), expectations));

  if (events.length === 0) return null;

  return (
    <Stack>
      <Stack gap={0}>
        <Title order={3}>Events</Title>
        <Text c="dimmed">As part of participation, these events have an expectation of a response. You can change this at any time.</Text>
      </Stack>
      <EventsList events={events} interactive />
    </Stack>
  );
}
