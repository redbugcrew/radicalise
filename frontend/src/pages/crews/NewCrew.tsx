import { Container, Stack, Title } from "@mantine/core"
import { useNavigate } from "react-router-dom"
import { handleAppEvents, useAppSelector } from "../../store"
import { CrewForm } from "../../components"
import type { CrewWithLinks } from "../../api/Api"
import { getApi } from "../../api"

export default function NewCrew() {
  const projectId = useAppSelector((state) => state.project?.id)

  const navigate = useNavigate()

  if (!projectId) return <Container>Error: Project not found</Container>

  const onSubmit = (values: CrewWithLinks) => {
    getApi()
      .api.createCrew(projectId, values)
      .then((response) => {
        handleAppEvents(response.data)
        navigate("../")
      })
      .catch((error) => {
        console.error("Error creating crew:", error)
      })
  }

  return (
    <Container>
      <Stack>
        <Title order={1}>New Crew</Title>
        <CrewForm projectId={projectId} onSubmit={onSubmit} />
      </Stack>
    </Container>
  )
}
