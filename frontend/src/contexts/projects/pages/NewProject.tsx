import { Container, Title } from "@mantine/core"
import type { Project } from "../../../api/Api"
import { actionSuccess, actionFailure, type ActionPromiseResult } from "../../../components/ActionResult"
import { useContext } from "react"
import ProjectForm from "../components/ProjectForm"
import { getApi } from "../../../api"
import { MyProjectsContext } from "./LoadMyProjects"
import { useNavigate } from "react-router-dom"

export default function NewProject() {
  const { addProject } = useContext(MyProjectsContext)
  const navigate = useNavigate()

  const onSubmit = async (project: Project): Promise<ActionPromiseResult> => {
    return getApi()
      .api.createProject(project)
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
      <Title order={1}>New Project</Title>

      <ProjectForm onSubmit={onSubmit} noLinks />
    </Container>
  )
}
