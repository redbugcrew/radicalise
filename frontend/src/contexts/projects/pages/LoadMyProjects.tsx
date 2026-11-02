import { createContext, useEffect, useState } from "react"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { getApi } from "../../../api"
import type { Project } from "../../../api/Api"

interface MyProjectsContextType {
  myProjects: Project[]
  addProject: (project: Project) => void
}

export const MyProjectsContext = createContext<MyProjectsContextType>({
  myProjects: [],
  addProject: () => {},
})

interface LoadMyProjectsProps {
  withRedirect?: boolean
}

export default function LoadMyProjects({ withRedirect }: LoadMyProjectsProps) {
  const [myProjects, setMyProjects] = useState<Project[] | undefined>(undefined)
  const navigate = useNavigate()
  const { projectSlug } = useParams<"projectSlug">()

  useEffect(() => {
    console.log("Loading project for current user")

    getApi()
      .api.getVisibleProjects()
      .then((response) => {
        if (response.status === 200) {
          const projects = response.data
          setMyProjects(response.data)

          if (projects.length > 0 && !projectSlug && withRedirect) {
            console.log("Redirecting to project: ", projects[0].slug)
            navigate(`/project/${projects[0].slug}`)
          }
        }
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          console.error("Unauthorized access - user may not be logged in")
          navigate("/auth/login")
        }
        console.error("Error fetching project data:", error)
        setMyProjects(undefined)
      })
  }, [projectSlug])

  const addProject = (project: Project) => {
    if (myProjects === undefined) return
    setMyProjects([...(myProjects ?? []), project])
  }

  if (myProjects === undefined) return null

  return (
    <MyProjectsContext value={{ myProjects, addProject }}>
      <Outlet />
    </MyProjectsContext>
  )
}
