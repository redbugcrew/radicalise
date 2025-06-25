import { Container, Stack, Title, Text } from "@mantine/core";
import ParticipationForm, { type MyParticipationFormData } from "../components/ParticipationForm";
import { useAppSelector } from "../store";
import { useParams } from "react-router-dom";
import DateText from "../components/DateText";
import { useEffect, useState } from "react";
import { getApi } from "../api";
import type { CollectiveInvolvementWithDetails } from "../api/Api";

export default function MyParticipation() {
  const { allIntervals, currentInterval } = useAppSelector((state) => state.intervals);
  const { intervalId } = useParams();
  const intervalIdNumber = Number(intervalId);
  const api = getApi();

  const interval = allIntervals.find((i) => i.id === intervalIdNumber);

  if (!interval) {
    return <Text>Error: Interval not found.</Text>;
  }
  if (!currentInterval) {
    return <Text>Error: Current interval not found.</Text>;
  }
  const readOnly = intervalIdNumber < currentInterval.id;

  const [involvement, setInvolvement] = useState<CollectiveInvolvementWithDetails | null>(null);
  useEffect(() => {
    api.api
      .myParticipation(interval.id)
      .then((response) => {
        setInvolvement(response.data);
      })
      .catch((error) => {
        console.error("Error fetching participation data:", error);
      });
  }, [interval.id]);

  if (readOnly && !involvement) {
    return <Text>Error: You were not participating in this interval.</Text>;
  }

  const onSubmit = (values: MyParticipationFormData) => {
    console.log("Form submitted with values:", values);
  };

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
      <ParticipationForm readOnly={readOnly} involvement={involvement} key={involvement?.id || "fresh"} onSubmit={onSubmit} />
    </Container>
  );
}
