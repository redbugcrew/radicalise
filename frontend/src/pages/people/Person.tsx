import { ActionIcon, Container, Group, Stack, Title, Text, Card } from "@mantine/core";
import { useAppSelector } from "../../store";
import { Anchor } from "../../components";
import { IconUserEdit } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import type { CapacityPlanning, CollectiveInvolvement, Person } from "../../api/Api";
import CapacityScoreIcon from "../../components/CapacityScoreIcon";
import DateText from "../../components/DateText";

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

export default function Person() {
  const { personId } = useParams<"personId">();
  const personIdNum = personId ? parseInt(personId, 10) : undefined;
  const meId = useAppSelector((state) => state.me?.person_id);
  const person = useAppSelector((state) => state.people[personIdNum || -1]);
  const collective_involvement = useAppSelector((state) => state.me?.current_interval?.collective_involvement || null);

  const canEdit = meId === person.id;

  return (
    <Container>
      <Stack>
        <Group justify="space-between">
          <Title order={1}>{person.display_name}</Title>
          {canEdit && (
            <Anchor href="edit">
              <ActionIcon variant="filled" aria-label="Edit Person" size="lg">
                <IconUserEdit style={{ width: "70%", height: "70%" }} stroke={2} />
              </ActionIcon>
            </Anchor>
          )}
        </Group>
        {collective_involvement?.status == "Exiting" && <ExitingInfo person={person} collective_involvement={collective_involvement} />}
        {collective_involvement?.status == "OnHiatus" && <HiatusInfo person={person} collective_involvement={collective_involvement} />}
        {person.about && (
          <Text size="md" style={{ whiteSpace: "pre-line" }}>
            {person.about}
          </Text>
        )}

        {!collective_involvement?.private_capacity_planning && collective_involvement?.capacity_planning && (
          <CapacityPlanningSection capacity_planning={collective_involvement.capacity_planning} capacity_score={collective_involvement.capacity_score} />
        )}
      </Stack>
    </Container>
  );
}
