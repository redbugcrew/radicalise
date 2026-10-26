import { createContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Outlet } from "react-router-dom"
import { getApi } from "../api"
import type { Project } from "../api/Api"

export const MyProjectsContext = createContext<Project[]>([])

export default function LoadMyProjects() {
  const [myProjects, setMyProjects] = useState<Project[] | undefined>(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    console.log("Loading project for current user")

    getApi()
      .api.getVisibleProjects()
      .then((response) => {
        if (response.status === 200) {
          setMyProjects(response.data)
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

  if (myProjects === undefined) return null

  return (
    <MyProjectsContext value={myProjects}>
      <Outlet />
    </MyProjectsContext>
  )
}
