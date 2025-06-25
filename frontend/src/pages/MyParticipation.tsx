import { Container, Stack, Title, Text } from "@mantine/core";
import ParticipationForm from "../components/ParticipationForm";
import { useAppSelector } from "../store";
import { useParams } from "react-router-dom";
import DateText from "../components/DateText";

export default function MyParticipation() {
  const { allIntervals, currentInterval } = useAppSelector((state) => state.intervals);
  const { intervalId } = useParams();
  const intervalIdNumber = Number(intervalId);

  const interval = allIntervals.find((i) => i.id === intervalIdNumber);

  console.log("Requested intervalId:", intervalId);
  console.log("Available intervals:", allIntervals);

  if (!interval) {
    return <Text>Error: Interval not found.</Text>;
  }
  if (!currentInterval) {
    return <Text>Error: Current interval not found.</Text>;
  }
  const readOnly = intervalIdNumber < currentInterval.id;

  return (
    <Container>
      <Stack gap={0} mb="xl">
        <Title order={1} size="h2">
          Participating in Interval {interval.id}
        </Title>
        <Text>
          <DateText date={interval.start_date} /> - <DateText date={interval.end_date} />
        </Text>
      </Stack>
      <ParticipationForm readOnly={readOnly} />
    </Container>
  );
}
