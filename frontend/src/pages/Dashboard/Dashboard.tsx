import { Button, Card, Container, Title, Stack, Text, Badge, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { CollectiveInvolvementWithDetails, Interval, MyIntervalData } from "../../api/Api";
import DateText from "../../components/DateText";
import classes from "./Dashboard.module.css";

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

      <Button mt="md" radius="md" onClick={() => navigate(`/my_participation/${interval.id}`)}>
        {current ? "Update" : "Plan"} your participation
      </Button>
    </Card>
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
      <Stack gap="md">
        {current_interval && myData.current_interval && <MyIntervalPartipationCard interval={current_interval} data={myData.current_interval} current={true} />}
        {next_interval && myData.next_interval && <MyIntervalPartipationCard interval={next_interval} data={myData.next_interval} current={false} />}
      </Stack>
    </Container>
  );
}
