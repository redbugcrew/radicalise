import { Stack, Title, Text } from "@mantine/core"
import CrewsForInterval from "./CrewsForInterval"
import { Anchor, IntervalSelector, NoData } from "../../components"
import { useAppSelector } from "../../store"
import { useSelectedInterval } from "../intervals/WithIntervalData"
import { useCurrentInterval } from "../../store/current_interval"

export default function Crews() {
  const intervals = useAppSelector((state) => state.intervals)
  const selectedInterval = useSelectedInterval()
  const currentInterval = useCurrentInterval()

  return (
    <Stack>
      <Title order={1}>Crews</Title>
      <IntervalSelector intervals={intervals} selectedInterval={selectedInterval} currentInterval={currentInterval} />

      {selectedInterval ? (
        <CrewsForInterval interval={selectedInterval} key={selectedInterval.id} />
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
