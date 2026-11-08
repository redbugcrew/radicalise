import { Container, Title } from "@mantine/core"
import CrewStatusForm from "../components/CrewStatusForm"
import { useNavigate, useParams } from "react-router-dom"
import { handleAppEvents, useAppSelector } from "../../../store"
import type { CrewStatus, UpdateCrewStatusRequest } from "../../../api/Api"
import { getApi } from "../../../api"
import { useFutureIntervals } from "../../../store/intervals"

export default function EditCrewStatus() {
  const { crewId } = useParams<"crewId">()
  const crewIdNum = crewId ? parseInt(crewId, 10) : undefined
  const projectId = useAppSelector((state) => state.project?.id)
  const intervals = useFutureIntervals(true)

  const navigate = useNavigate()

  const crew = useAppSelector((state) => state.crews[crewIdNum || -1])

  if (!crew) return <Container>Error: Crew not found</Container>
  if (!projectId) return <Container>Error: Project not found</Container>
  if (!intervals) return <Container>Error: You need a current or future interval to set the status</Container>

  const onSubmit = (values: UpdateCrewStatusRequest) => {
    getApi()
      .api.updateCrewStatus(crew.id, projectId, values)
      .then((response) => {
        handleAppEvents(response.data)
        navigate("../")
      })
      .catch((error) => {
        console.error("Error updating crew:", error)
      })
  }

  return (
    <Container>
      <Title order={1}>Edit Status</Title>
      <Title order={2} size="h4" mb="lg">
        {crew.name}
      </Title>
      <CrewStatusForm intervals={intervals} currentIntervalNumber={intervals[0].number} onSubmit={onSubmit} />
    </Container>
  )
}
