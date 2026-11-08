import { Container, Stack, Title } from "@mantine/core"
import { useNavigate } from "react-router-dom"
import { handleAppEvents, useAppSelector } from "../../../store"
import { useFutureIntervals } from "../../../store/intervals"
import { default as CreateCrewForm } from "../components/CreateCrewForm"
import type { CreateCrewData } from "../../../api/Api"
import { getApi } from "../../../api"

export default function NewCrew() {
  const projectId = useAppSelector((state) => state.project?.id)
  const intervals = useFutureIntervals(true)

  const navigate = useNavigate()

  if (!projectId) return <Container>Error: Project not found</Container>

  const onSubmit = (values: CreateCrewData) => {
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
        <CreateCrewForm projectId={projectId} intervals={intervals} onSubmit={onSubmit} />
      </Stack>
    </Container>
  )
}
