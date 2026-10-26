import { createContext, useEffect, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import type { Project } from "../api/Api"
import { getApi } from "../api"
import { Container, Stack, Title, Text, AppShell } from "@mantine/core"
import { MyProjectsContext } from "./LoadMyProjects"

interface SelectedProjectData {
  project: Project
  canAccess: boolean
}

export const SelectedProjectContext = createContext<SelectedProjectData | undefined>(undefined)

export default function LoadSelectedProject() {
  return <MyProjectsContext.Consumer>{(projects) => <LoadSelectedProjectInner myProjects={projects} />}</MyProjectsContext.Consumer>
}

interface LoadSelectedProjectInnerProps {
  myProjects: Project[]
}

function LoadSelectedProjectInner({ myProjects }: LoadSelectedProjectInnerProps) {
  const { projectSlug } = useParams<"projectSlug">()
  const [selectedProjectData, setSelectedProjectData] = useState<SelectedProjectData | null | undefined>(undefined)

  useEffect(() => {
    if (!projectSlug) {
      console.error("No project slug provided in the URL parameters.")
      return
    }

    const projectInMyProjects = myProjects.find((project) => project.slug === projectSlug)
    if (projectInMyProjects) {
      console.log("Project found in my projects:", projectInMyProjects)
      setSelectedProjectData({ project: projectInMyProjects, canAccess: true })
      return
    }

    getApi()
      .api.getProjectBySlug(projectSlug)
      .then((response) => {
        if (response.status === 200) {
          const project = response.data
          console.log("Project fetched by slug:", project)
          setSelectedProjectData({ project, canAccess: false })
        }
      })
      .catch((error) => {
        console.error("Error fetching project data:", error)
        setSelectedProjectData(null)
      })
  }, [projectSlug, myProjects])

  if (selectedProjectData === undefined) return null

  if (selectedProjectData === null)
    return (
      <AppShell.Main>
        <Container pt="lg" pb="xl">
          <Stack mt="lg">
            <Title order={1}>Sorry, we couldn't find that project</Title>
            <Text>There was an error fetching the project "{projectSlug}".</Text>
          </Stack>
        </Container>
      </AppShell.Main>
    )

  return (
    <SelectedProjectContext value={selectedProjectData}>
      <Outlet />
    </SelectedProjectContext>
  )
}
