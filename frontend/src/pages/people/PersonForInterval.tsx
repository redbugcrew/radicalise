import { Container, Group, Stack, Title, Text, Card } from "@mantine/core";
import { useAppSelector } from "../../store";
import type { CapacityPlanning, CollectiveInvolvement, Interval, Person } from "../../api/Api";
import CapacityScoreIcon from "../../components/CapacityScoreIcon";
import DateText from "../../components/DateText";
import { oneForPerson } from "../../store/involvements";
import WithIntervalInvolvements from "../intervals/WithIntervalInvolvements";

function CapacityQuestion({ question, answer }: { question: string; answer: string | null | undefined }) {
  if (!answer) return null;

  return (
    <Stack gap={0}>
      <Text fw={500}>{question}</Text>
      <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-line" }}>
        {answer}
      </Text>
    </Stack>
  );
}

function CapacityPlanningSection({ capacity_planning, capacity_score }: { capacity_planning: CapacityPlanning; capacity_score: number | null | undefined }) {
  if (!capacity_planning) return null;
  if (!capacity_planning.wellbeing && !capacity_planning.focus && !capacity_planning.capacity) return null;

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Title order={2} size="h3">
          My capacity
        </Title>
        <CapacityScoreIcon score={capacity_score} />
      </Group>
      <Stack gap="xs">
        <CapacityQuestion question="Wellbeing" answer={capacity_planning.wellbeing} />
        <CapacityQuestion question="Focus" answer={capacity_planning.focus} />
        <CapacityQuestion question="Capacity" answer={capacity_planning.capacity} />
      </Stack>
    </Card>
  );
}

function ExitingInfo({ person, collective_involvement }: { person: Person; collective_involvement: CollectiveInvolvement }) {
  return (
    <Card withBorder style={{ borderColor: "var(--mantine-color-red-6)" }}>
      <Title order={2} size="h3" mb="md">
        {person.display_name} is exiting the collective.
      </Title>
      <Text size="md" c="dimmed" style={{ whiteSpace: "pre-line" }}>
        {collective_involvement.intention_context || "No exit reason provided."}
      </Text>
    </Card>
  );
}

function HiatusInfo({ person, collective_involvement }: { person: Person; collective_involvement: CollectiveInvolvement }) {
  return (
    <Card withBorder style={{ borderColor: "var(--mantine-color-blue-5)" }}>
      <Title order={2} size="h3">
        {person.display_name} is on hiatus from the collective.
      </Title>
      <Text>
        Until <DateText date={collective_involvement.opt_out_planned_return_date} />
      </Text>
      <Text size="md" c="dimmed" style={{ whiteSpace: "pre-line" }} mt={"md"}>
        {collective_involvement.intention_context || "No exit reason provided."}
      </Text>
    </Card>
  );
}

interface PersonForIntervalProps {
  personIdNum: number;
  interval: Interval;
}

export default function PersonForInterval({ personIdNum, interval }: PersonForIntervalProps) {
  const person = useAppSelector((state) => state.people[personIdNum || -1]);

  return (
    <WithIntervalInvolvements interval={interval}>
      {({ involvements, key }) => {
        const myInvolvement = involvements ? oneForPerson(involvements.collective_involvements, personIdNum) : null;

        return (
          <Container key={key}>
            <Stack>
              {myInvolvement?.status == "Exiting" && <ExitingInfo person={person} collective_involvement={myInvolvement} />}
              {myInvolvement?.status == "OnHiatus" && <HiatusInfo person={person} collective_involvement={myInvolvement} />}
              {person.about && (
                <Text size="md" style={{ whiteSpace: "pre-line" }}>
                  {person.about}
                </Text>
              )}

              {!myInvolvement?.private_capacity_planning && myInvolvement?.capacity_planning && (
                <CapacityPlanningSection capacity_planning={myInvolvement.capacity_planning} capacity_score={myInvolvement.capacity_score} />
              )}
            </Stack>
          </Container>
        );
      }}
    </WithIntervalInvolvements>
  );
}
