import { Stack, Title, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { EventResponseExpectation, type CrewInvolvement, type Interval } from "../../api/Api";
import { useAppSelector } from "../../store";
import { CrewParticipationsInput } from "../";
import type { CrewWithLinks } from "../../store/crews";
import type { MyParticipationFormData } from "./shared";
import { occurInInterval, withResponseExpection } from "../../store/events";
import EventsList from "../../contexts/events/components/EventsList";

interface ContributionStepProps {
  personId: number;
  interval: Interval;
  crewInvolvements: CrewInvolvement[];
  previousInvolvements?: CrewInvolvement[] | undefined | null;
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
}

function CrewContributions({ form, readOnly, personId, interval, crewInvolvements, previousInvolvements }: ContributionStepProps) {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap) as CrewWithLinks[];
  const people = useAppSelector((state) => state.people);

  return (
    <Stack gap="lg">
      <Stack gap={0}>
        <Title order={3}>Crews</Title>
        <Text c="dimmed">Without forming crews, nothing gets done. Crews don't run for the interval unless they have participants</Text>
      </Stack>

      <CrewParticipationsInput
        personId={personId}
        intervalId={interval.id}
        crews={crews}
        people={people}
        disabled={readOnly}
        crewInvolvements={crewInvolvements}
        previousInvolvements={previousInvolvements}
        key={form.key("crew_involvements")}
        {...form.getInputProps("crew_involvements")}
      />
    </Stack>
  );
}

function EventContributions({ interval }: { interval: Interval }) {
  const expectations = [EventResponseExpectation.Encouraged, EventResponseExpectation.Welcome];
  const events = useAppSelector((state) => withResponseExpection(occurInInterval(state.events, interval), expectations));

  if (events.length === 0) return null;

  return (
    <Stack gap="md">
      <Stack gap={0}>
        <Title order={3}>Events</Title>
        <Text c="dimmed">As part of additional participation, you might want to let people know if you're going to these events. You can change these at any time.</Text>
      </Stack>
      <EventsList events={events} interactive />
    </Stack>
  );
}

export default function ContributionStep(props: ContributionStepProps) {
  return (
    <Stack gap="xl">
      <CrewContributions {...props} />
      <EventContributions interval={props.interval} />
    </Stack>
  );
}
