import { Button, Card, Container, Title, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { useNextInterval } from "../../store/intervals";
import type { Interval } from "../../api/Api";
import DateText from "../../components/DateText";

interface MyIntervalPartipationCardProps {
  interval: Interval;
  current: boolean;
}

function MyIntervalPartipationCard({ interval, current = true }: MyIntervalPartipationCardProps) {
  const navigate = useNavigate();

  return (
    <Card withBorder>
      <Stack gap={0}>
        <Title order={2} size="md">
          {current ? "Current" : "Next"} interval #{interval.id}
        </Title>
        <Text>
          <DateText date={interval.start_date} /> - <DateText date={interval.end_date} />
        </Text>
      </Stack>
      <Button mt="md" radius="md" onClick={() => navigate(`/my_participation/${interval.id}`)}>
        {current ? "Update" : "Plan"} your participation
      </Button>
    </Card>
  );
}

export default function Dashboard() {
  const { currentInterval } = useAppSelector((state) => state.intervals);
  const nextInterval = useNextInterval();

  return (
    <Container>
      <Title order={1} mb="md">
        My Dashboard
      </Title>
      <Stack gap="md">
        {currentInterval && <MyIntervalPartipationCard interval={currentInterval} current={true} />}
        {nextInterval && <MyIntervalPartipationCard interval={nextInterval} current={false} />}
      </Stack>
    </Container>
  );
}
