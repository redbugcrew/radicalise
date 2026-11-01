import { createContext, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
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

export default function LoadMyProjects() {
  const [myProjects, setMyProjects] = useState<Project[] | undefined>(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    console.log("Loading project for current user")

    getApi()
      .api.getVisibleProjects()
      .then((response) => {
        if (response.status === 200) {
          const projects = response.data
          setMyProjects(response.data)

          if (projects.length > 0) {
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
  }, [])

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
