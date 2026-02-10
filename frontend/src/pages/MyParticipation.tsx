import { Container, Stack, Title, Text } from "@mantine/core";
import ParticipationForm, { type MyParticipationFormData } from "../components/ParticipationForm/ParticipationForm";
import { handleAppEvents, useAppSelector } from "../store";
import { useNavigate, useParams } from "react-router-dom";
import DateText from "../components/DateText";
import { useEffect, useState } from "react";
import { getApi } from "../api";
import type { CollectiveInvolvement, MyParticipationInput } from "../api/Api";
import { findPreviousInterval } from "../store/intervals";

export default function MyParticipation() {
  const { allIntervals, currentInterval } = useAppSelector((state) => state.intervals);
  const collective = useAppSelector((state) => state.collective);
  const personId = useAppSelector((state) => state.me?.person_id);

  const navigate = useNavigate();

  if (!collective) return <Text>Error: Collective not found.</Text>;
  if (!personId) return <Text>Error: Person ID not found.</Text>;

  const { intervalId } = useParams();
  const intervalIdNumber = Number(intervalId);
  const api = getApi();

  const interval = allIntervals.find((i) => i.id === intervalIdNumber);
  const previousInterval = findPreviousInterval(allIntervals, intervalIdNumber);

  if (!interval) {
    return <Text>Error: Interval not found.</Text>;
  }
  if (!currentInterval) {
    return <Text>Error: Current interval not found.</Text>;
  }

  const readOnly = intervalIdNumber < currentInterval.id;

  const [involvement, setInvolvement] = useState<CollectiveInvolvement | null>(null);
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
    const inputData: MyParticipationInput = {
      collective_id: collective.id,
      ...involvement,
      ...values,
      capacity_score: values.capacity_score ? parseInt(values.capacity_score) : null,
    };

    api.api
      .updateMyParticipation(interval.id, inputData)
      .then((response) => {
        console.log("Participation updated successfully", response);
        handleAppEvents(response.data);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error updating participation:", error);
      });
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
      <ParticipationForm
        readOnly={readOnly}
        personId={personId}
        involvement={involvement}
        key={involvement?.id || `fresh-${interval.id}`}
        onSubmit={onSubmit}
        interval={interval}
        previousIntervalId={previousInterval?.id}
      />
    </Container>
  );
}
