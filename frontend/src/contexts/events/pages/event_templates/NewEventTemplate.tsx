import { Container, Title, Stack } from "@mantine/core"
import EventTemplateForm from "../../components/event_templates/EventTemplateForm"
import { getApi } from "../../../../api"
import type { EventTemplate } from "../../../../api/Api"
import { handleAppEvents, useAppSelector } from "../../../../store"
import { useNavigate } from "react-router-dom"

export default function NewEventTemplate() {
  const projectId = useAppSelector((state) => state.project?.id)
  const navigate = useNavigate()

  if (!projectId) return <Container>Error: Project not found</Container>

  const handleSubmit = async (data: EventTemplate): Promise<void> => {
    return getApi()
      .api.createEventTemplate(projectId, data)
      .then((response) => {
        handleAppEvents(response.data)
        navigate("..")
      })
      .catch((error) => {
        console.error("Error creating event template:", error)
      })
  }

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Event Template</Title>
        <EventTemplateForm onSubmit={handleSubmit} />
      </Stack>
    </Container>
  )
}
