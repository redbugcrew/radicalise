import { ActionIcon, Group, Stack, Title } from "@mantine/core";
import PersonForInterval from "./PersonForInterval";
import { useAppSelector } from "../../store";
import { useSelectedInterval } from "../intervals/WithIntervalInvolvements";
import { IntervalSelector } from "../../components";
import { Anchor } from "../../components";
import { IconUserEdit } from "@tabler/icons-react";
import { useParams } from "react-router-dom";

export default function Person() {
  const { personId } = useParams<"personId">();
  const personIdNum = personId ? parseInt(personId, 10) : undefined;
  const intervals = useAppSelector((state) => state.intervals);
  const selectedInterval = useSelectedInterval();
  const person = useAppSelector((state) => state.people[personIdNum || -1]);
  const meId = useAppSelector((state) => state.me?.person_id);
  const canEdit = meId === person.id;

  return (
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

      <IntervalSelector intervals={intervals.allIntervals} selectedInterval={selectedInterval} currentInterval={intervals.currentInterval} />
      {personIdNum !== undefined && selectedInterval && <PersonForInterval personIdNum={personIdNum} interval={selectedInterval} />}
    </Stack>
  );
}
