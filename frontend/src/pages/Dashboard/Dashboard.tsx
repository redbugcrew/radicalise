import { Button, Card, Container, Title, Stack, Text, Badge, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { CollectiveInvolvementWithDetails, CrewInvolvement, Interval, MyIntervalData } from "../../api/Api";
import DateText from "../../components/DateText";
import classes from "./Dashboard.module.css";
import { CrewsList } from "../../components";
import { forPerson } from "../../store/involvements";
import { compareStrings } from "../../utilities/comparison";

interface MyIntervalPartipationCardProps {
  interval: Interval;
  data: MyIntervalData;
  current: boolean;
}

function ParticipationBadge({ involvement }: { involvement: CollectiveInvolvementWithDetails | null }) {
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

export default function Dashboard() {
  const intervals = useAppSelector((state) => state.intervals);

  const myData = useAppSelector((state) => state.me);

  if (!myData) {
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
        {myData.current_interval && <MyCrews personId={myData.person_id} myInvolvements={myData.current_interval.crew_involvements} />}
      </Stack>
    </Container>
  );
}
