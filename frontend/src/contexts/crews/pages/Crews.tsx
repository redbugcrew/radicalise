import { Stack, Title, Text, Group, ActionIcon } from "@mantine/core"
import CrewsForInterval from "../components/CrewsForInterval"
import { Anchor, IntervalSelector, NoData } from "../../../components"
import { useAppSelector } from "../../../store"
import { useSelectedInterval } from "../../../pages/intervals/WithIntervalData"
import { useCurrentInterval } from "../../../store/current_interval"
import { IconPlus } from "@tabler/icons-react"

export default function Crews() {
  const intervals = useAppSelector((state) => state.intervals)
  const selectedInterval = useSelectedInterval()
  const currentInterval = useCurrentInterval()

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Crews</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Create new Crew" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>

      <IntervalSelector intervals={intervals} selectedInterval={selectedInterval} currentInterval={currentInterval} />

      {selectedInterval ? (
        <CrewsForInterval interval={selectedInterval} key={selectedInterval.number} />
      ) : (
        <NoData title="No current interval">
          <Stack>
            <Text>People participate in the crews during intervals. To see the crews, first setup your project intervals.</Text>
            <Anchor href="../intervals">Manage project intervals</Anchor>
          </Stack>
        </NoData>
      )}
    </Stack>
  )
}
