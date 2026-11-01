import { Stack, Group, Title, ActionIcon, Text } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import { Anchor, NoData } from "../../../../components"
import { useAppSelector } from "../../../../store"
import EventTemplatesTable from "../../components/event_templates/EventTemplatesTable"

export default function EventTemplates() {
  const eventTemplates = useAppSelector((state) => state.eventTemplates)

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Event Templates</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Event Template" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      {eventTemplates.length === 0 ? (
        <NoData title="No event templates">
          <Stack>
            <Text>
              Event templates are used to create events. You can setup templates for recurring events, such as meetings, or you can create a
              general template you use for a range of different events.
            </Text>
            <Anchor href="new">Create your first template</Anchor>
          </Stack>
        </NoData>
      ) : (
        <EventTemplatesTable eventTemplates={eventTemplates} />
      )}
    </Stack>
  )
}
