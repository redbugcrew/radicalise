import { Group, Stack, Title, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { CrewInvolvement } from "../../api/Api";
import { useAppSelector } from "../../store";
import { CrewParticipationsInput } from "../";
import type { CrewWithLinks } from "../../store/crews";
import type { MyParticipationFormData } from "./shared";

interface ContributionStepProps {
  personId: number;
  intervalId: number;
  crewInvolvements: CrewInvolvement[];
  previousInvolvements?: CrewInvolvement[] | undefined | null;
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
}

export default function ContributionStep({ form, readOnly, personId, intervalId, crewInvolvements, previousInvolvements }: ContributionStepProps) {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap) as CrewWithLinks[];
  const people = useAppSelector((state) => state.people);

  return (
    <Stack mt="lg" gap="md">
      <Stack gap={0} mb="md">
        <Group justify="space-between">
          <Title order={3}>Crews</Title>
        </Group>
        <Text c="dimmed">Without forming crews, nothing gets done. Crews don't run for the interval unless they have participants</Text>
      </Stack>

      <CrewParticipationsInput
        personId={personId}
        intervalId={intervalId}
        crews={crews}
        people={people}
        disabled={readOnly}
        crewInvolvements={crewInvolvements}
        previousInvolvements={previousInvolvements}
        key={form.key("crew_involvements")}
        {...form.getInputProps("crew_involvements")}
      />
    </Stack>
  );
}
