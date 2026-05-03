import { Button, Card, Container, Title, Stack, Text, Badge, Group, Collapse } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { AttendanceIntention, type CalendarEvent, type CircleInvolvement, type CrewInvolvement, type Interval } from "../../api/Api";
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
import { currentCircleStateOrDefault, myCircleInvolvement, myCrewInvolvements } from "../../store/involvements";
import { intervalById } from "../../store/intervals";

function ParticipationBadge({ involvement }: { involvement: CircleInvolvement | null }) {
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

interface MyIntervalPartipationCardProps {
  interval: Interval;
  circleInvolvement: CircleInvolvement | null;
  current: boolean;
}

function MyIntervalPartipationCard({ interval, circleInvolvement, current = true }: MyIntervalPartipationCardProps) {
  const navigate = useNavigate();

  return (
    <Card withBorder className={circleInvolvement ? "" : classes.unplanned}>
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Title order={2} size="md">
            {current ? "Current" : "Next"} interval #{interval.id}
          </Title>
          <Text>
            <DateText date={interval.start_date} /> - <DateText date={interval.end_date} />
          </Text>
        </Stack>
        <ParticipationBadge involvement={circleInvolvement || null} />
      </Group>

      <Button variant={current ? "outline" : "filled"} mt="md" radius="md" onClick={() => navigate(`/my_participation/${interval.id}`)}>
        {current ? "Update" : "Plan"} your participation
      </Button>
    </Card>
  );
}

function MyCrews({ personId, circleId, myInvolvements }: { personId: number; circleId: number; myInvolvements: CrewInvolvement[] }) {
  const people = useAppSelector((state) => state.people);
  const crews = useAppSelector((state) => state.crews);
  const circleState = useAppSelector((state) => currentCircleStateOrDefault(state.involvements, circleId));

  if (!circleState) return null;
  const allInvolvements = circleState.crew_involvements || [];

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
  let apiUrl = getApiUrl();
  if (apiUrl === "/") {
    apiUrl = window.location.origin;
  }
  apiUrl = apiUrl.replace(/\/?$/, "");

  const calendarUrl = `${apiUrl}/api/public/${calendarToken}/calendar.ics`;

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
          <Collapse expanded={opened}>
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
  const project = useAppSelector((state) => state.project);
  const circleId = useAppSelector((state) => state.circles.activeCircleId || null);
  const involvements = useAppSelector((state) => state.involvements);

  if (!myData || !project || !circleId) {
    return <Text>Error: Data not found.</Text>;
  }

  const personId = myData.person_id;
  const myCurrentCircle = myCircleInvolvement(involvements, circleId, personId, "current_interval");
  const currentInterval = myCurrentCircle ? intervalById(intervals, myCurrentCircle.interval_id) : null;

  const myNextCircle = myCircleInvolvement(involvements, circleId, personId, "next_interval");
  const nextInterval = myNextCircle ? intervalById(intervals, myNextCircle.interval_id) : null;

  const myCurrentCrewInvolvements = myCrewInvolvements(involvements, circleId, personId, "current_interval");

  return (
    <Container>
      <Title order={1} mb="md">
        My Dashboard
      </Title>
      <Stack gap="lg">
        <Stack gap="md">
          {myCurrentCircle && currentInterval && <MyIntervalPartipationCard interval={currentInterval} circleInvolvement={myCurrentCircle} current={true} />}
          {myNextCircle && nextInterval && <MyIntervalPartipationCard interval={nextInterval} circleInvolvement={myNextCircle} current={false} />}
        </Stack>
        <MyEvents />
        {myCurrentCrewInvolvements && <MyCrews personId={myData.person_id} circleId={circleId} myInvolvements={myCurrentCrewInvolvements} />}
        <Stack gap="md">
          <Title order={2}>Resources</Title>
          <LinksStack links={project.links} />
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
    const isParticipant = attendances.some((attendance) => attendance.person_id === personId && attendance.intention && intentions.includes(attendance.intention));
    const isFutureEvent = isFutureOrStillInProgress(event);
    return isParticipant && isFutureEvent;
  });
}

function isFutureOrStillInProgress(event: CalendarEvent): boolean {
  return (event.end_at && isFuture(event.end_at)) || isFuture(event.start_at);
}
