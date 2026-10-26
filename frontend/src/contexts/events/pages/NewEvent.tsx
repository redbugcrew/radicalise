import { Container, Title, Stack } from "@mantine/core"
import EventForm from "../components/EventForm"
import { handleAppEvents, useAppSelector } from "../../../store"
import { getApi } from "../../../api"
import { useNavigate } from "react-router-dom"
import type { CalendarEvent } from "../../../api/Api"

export default function NewEvent() {
  const eventTemplates = useAppSelector((state) => state.eventTemplates)
  const projectId = useAppSelector((state) => state.project?.id)
  const navigate = useNavigate()

  if (!projectId)
    return (
      <Container>
        <p>No project selected.</p>
      </Container>
    )

  const handleSubmit = async (data: CalendarEvent): Promise<void> => {
    return getApi()
      .api.createCalendarEvent(projectId, data)
      .then((response) => {
        handleAppEvents(response.data)
        navigate("..")
      })
      .catch((error) => {
        console.error("Error creating event:", error)
      })
  }

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Event</Title>

        {eventTemplates.length === 0 && <p>No event templates available. Please create one first.</p>}

        {eventTemplates.length > 0 && <EventForm onSubmit={handleSubmit} eventTemplates={eventTemplates} />}
      </Stack>
    </Container>
  )
}
