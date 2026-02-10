import { Button, Card, Container, Title, Stack, Text, Badge, Group, Collapse } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { AttendanceIntention, type CalendarEvent, type CollectiveInvolvement, type CrewInvolvement, type Interval, type PersonIntervalInvolvementData } from "../../api/Api";
import DateText from "../../components/DateText";
import classes from "./Dashboard.module.css";
import { CrewsList, LinksStack } from "../../components";
import { compareStrings } from "../../utilities/comparison";
import { isFuture } from "date-fns";
import EventsList from "../../contexts/events/components/EventsList";
import { IconCalendar } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import CopyIconButton from "../../components/CopyIconButton";
import { getApiUrl } from "../../api";

interface MyIntervalPartipationCardProps {
  interval: Interval;
  data: PersonIntervalInvolvementData;
  current: boolean;
}

function ParticipationBadge({ involvement }: { involvement: CollectiveInvolvement | null }) {
  if (!involvement) return <Badge color="gray">No intention</Badge>;

  const { participation_intention, opt_out_type } = involvement;

  switch (participation_intention) {
    case "OptIn":
      return <Badge color="green">Participating</Badge>;
    case "OptOut":
      switch (opt_out_type) {
        case "Hiatus":
          return <Badge color="orange">On Hiatus</Badge>;
        case "Exit":
          return <Badge color="red">Exiting</Badge>;
        default:
          return <Badge color="red">Opt-out</Badge>;
      }
    default:
      return <Badge color="gray">No intention</Badge>;
  }
}

function MyIntervalPartipationCard({ interval, data, current = true }: MyIntervalPartipationCardProps) {
  const navigate = useNavigate();
  const { collective_involvement } = data;

  return (
    <Card withBorder className={collective_involvement ? "" : classes.unplanned}>
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Title order={2} size="md">
            {current ? "Current" : "Next"} interval #{interval.id}
          </Title>
          <Text>
            <DateText date={interval.start_date} /> - <DateText date={interval.end_date} />
          </Text>
        </Stack>
        <ParticipationBadge involvement={collective_involvement || null} />
      </Group>

      <Button variant={current ? "outline" : "filled"} mt="md" radius="md" onClick={() => navigate(`/my_participation/${interval.id}`)}>
        {current ? "Update" : "Plan"} your participation
      </Button>
    </Card>
  );
}

function MyCrews({ personId, myInvolvements }: { personId: number; myInvolvements: CrewInvolvement[] }) {
  const people = useAppSelector((state) => state.people);
  const crews = useAppSelector((state) => state.crews);
  const allInvolvements = useAppSelector((state) => state.involvements.current_interval?.crew_involvements || []);

  const myCrews = myInvolvements
    .map((involvement) => crews[involvement.crew_id])
    .filter(Boolean)
    .sort(compareStrings("name"));

  if (myCrews.length === 0) return null;

  return (
    <Stack>
      <Title order={2}>My Crews</Title>
      <CrewsList involvements={allInvolvements} people={people} crews={myCrews} highlightPersonId={personId} />
    </Stack>
  );
}

function SubscribeDetails({ calendarToken }: { calendarToken: string }) {
  const apiUrl = getApiUrl();
  const calendarUrl = `${apiUrl.replace(/\/?$/, "/")}api/public/${calendarToken}/calendar.ics`;

  return (
    <Card mb="md">
      <Title order={3}>Subscribe your calendar</Title>
      <Text>To have a live subscription to your calendar events, copy the URL below, and in your calendar application, add it as a new subscription.</Text>
      <Group mt="md" wrap="nowrap" justify="flex-start">
        <CopyIconButton value={calendarUrl} />
        <Text
          component="pre"
          style={{
            border: "1px solid var(--mantine-color-gray-6)",
            padding: "4px 10px",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {calendarUrl}
        </Text>
      </Group>
    </Card>
  );
}

function MyEvents() {
  const events = useAppSelector((state) => myUpcomingEvents(state.events, state.me?.person_id));
  const [opened, { toggle }] = useDisclosure(false);
  const calendarToken = useAppSelector((state) => state.me?.calendar_token);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>My Upcoming Events</Title>
        {calendarToken && (
          <Button rightSection={<IconCalendar />} variant="outline" onClick={toggle}>
            {opened ? "Hide" : "Subscribe"}
          </Button>
        )}
      </Group>
      <Stack gap={0}>
        {calendarToken && (
          <Collapse in={opened}>
            <SubscribeDetails calendarToken={calendarToken} />
          </Collapse>
        )}
        <EventsList events={events} noDataMessage="No upcoming events found" />
      </Stack>
    </Stack>
  );
}

export default function Dashboard() {
  const intervals = useAppSelector((state) => state.intervals);
  const myData = useAppSelector((state) => state.me);
  const collective = useAppSelector((state) => state.collective);

  if (!myData || !collective) {
    return <Text>Error: Data not found.</Text>;
  }

  const intervalForId = (id: number | undefined): Interval | null => {
    if (typeof id !== "undefined") {
      return intervals.allIntervals.find((interval) => interval.id === id) || null;
    }
    return null;
  };

  const current_interval = intervalForId(myData.current_interval?.interval_id);
  const next_interval = intervalForId(myData.next_interval?.interval_id);

  return (
    <Container>
      <Title order={1} mb="md">
        My Dashboard
      </Title>
      <Stack gap="lg">
        <Stack gap="md">
          {current_interval && myData.current_interval && <MyIntervalPartipationCard interval={current_interval} data={myData.current_interval} current={true} />}
          {next_interval && myData.next_interval && <MyIntervalPartipationCard interval={next_interval} data={myData.next_interval} current={false} />}
        </Stack>
        <MyEvents />
        {myData.current_interval && <MyCrews personId={myData.person_id} myInvolvements={myData.current_interval.crew_involvements} />}
        <Stack gap="md">
          <Title order={2}>Resources</Title>
          <LinksStack links={collective.links} />
        </Stack>
      </Stack>
    </Container>
  );
}

function myUpcomingEvents(events: CalendarEvent[], personId: number | null | undefined): CalendarEvent[] {
  if (!personId) return [];
  return events.filter((event) => {
    const attendances = event.attendances || [];
    const intentions = [AttendanceIntention.Going, AttendanceIntention.Uncertain];
    const isParticipant = attendances.some((attendance) => attendance.person_id === personId && intentions.includes(attendance.intention));
    const isFutureEvent = isFutureOrStillInProgress(event);
    return isParticipant && isFutureEvent;
  });
}

function isFutureOrStillInProgress(event: CalendarEvent): boolean {
  return (event.end_at && isFuture(event.end_at)) || isFuture(event.start_at);
}
