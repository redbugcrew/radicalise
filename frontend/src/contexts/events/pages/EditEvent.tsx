import { Container, Title, Stack } from "@mantine/core"
import EventForm from "../components/EventForm"
import { handleAppEvents, useAppSelector } from "../../../store"
import { getApi } from "../../../api"
import { useNavigate, useParams } from "react-router-dom"
import type { CalendarEvent } from "../../../api/Api"

export default function EditEvent() {
  const { eventId } = useParams<"eventId">()
  const eventIdNum = eventId ? parseInt(eventId, 10) : undefined

  const event = useAppSelector((state) => state.events.find((e) => e.id === eventIdNum))
  const projectId = useAppSelector((state) => state.project?.id)
  const navigate = useNavigate()

  if (eventIdNum === undefined) return <div>Invalid Event ID</div>
  if (!event) return <div>Event not found</div>
  if (!projectId) return <div>No project selected.</div>

  const handleSubmit = async (data: CalendarEvent): Promise<void> => {
    return getApi()
      .api.updateCalendarEvent(projectId, event.id, data)
      .then((response) => {
        handleAppEvents(response.data)
        navigate(`../${event.id}`)
      })
      .catch((error) => {
        console.error("Error updating event:", error)
      })
  }

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>Edit Event</Title>

        {event && <EventForm onSubmit={handleSubmit} value={event} submitText="Update event" />}
      </Stack>
    </Container>
  )
}
