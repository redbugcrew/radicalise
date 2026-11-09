import { Container, Stack, Title, Text } from "@mantine/core"
import { actionSuccess, actionFailure, type ActionPromiseResult } from "../../../components/ActionResult"
import { useContext } from "react"
import { useUserPermissions } from "../../auth/pages/auth_hooks"
import NewProjectForm from "../components/NewProjectForm"
import { getApi } from "../../../api"
import { MyProjectsContext } from "./LoadMyProjects"
import { useNavigate } from "react-router-dom"
import type { NewProjectData } from "../../../api/Api"

export default function NewProject() {
  const { addProject } = useContext(MyProjectsContext)
  const navigate = useNavigate()
  const userPermissions = useUserPermissions()

  if (!userPermissions?.can_create_projects) {
    return (
      <Container>
        <Stack>
          <Title order={1}>Welcome</Title>

          <Text>You do not have permission to create new projects.</Text>
        </Stack>
      </Container>
    )
  }

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
