import { Container, Title } from "@mantine/core"
import { getApi } from "../../../api"
import type { Project } from "../../../api/Api"
import ProjectForm from "../components/ProjectForm"

export default function NewProject() {
  const onSubmit = (values: Project) => {
    // getApi()
    //   .api.updateProject(project.id, values)
    //   .then((response) => {
    //     if (response.status === 200) {
    //       handleAppEvents(response.data)
    //       navigate("../../dashboard")
    //     } else {
    //       console.error("Failed to update project:", response)
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error updating project:", error)
    //   })
  }

  return (
    <Container>
      <Title order={1}>New Project</Title>

      <ProjectForm onSubmit={onSubmit} />
    </Container>
  )
}
