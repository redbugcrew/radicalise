import { Container, Stack, Title } from "@mantine/core"
import { actionSuccess, actionFailure, type ActionPromiseResult } from "../../../components/ActionResult"
import { useContext } from "react"
import NewProjectForm from "../components/NewProjectForm"
import { getApi } from "../../../api"
import { MyProjectsContext } from "./LoadMyProjects"
import { useNavigate } from "react-router-dom"
import type { NewProjectData } from "../../../api/Api"

export default function NewProject() {
  const { addProject } = useContext(MyProjectsContext)
  const navigate = useNavigate()

  const onSubmit = async (values: NewProjectData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.createProject(values)
      .then((response) => {
        addProject(response.data)

        navigate(`/project/${response.data.slug}`)
        return actionSuccess()
      })
      .catch((error) => {
        return actionFailure(error)
      })
  }

  return (
    <Container>
      <Stack>
        <Title order={1}>New Project</Title>

        <NewProjectForm onSubmit={onSubmit} />
      </Stack>
    </Container>
  )
}
