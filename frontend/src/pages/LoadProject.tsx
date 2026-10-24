import { useEffect, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import { loadInitialProjectData } from "../store"

export default function LoadProject() {
  const { projectSlug } = useParams<"projectSlug">()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Loading project with slug:", projectSlug)

    loadInitialProjectData().then(() => setLoading(false))
  }, [projectSlug])

  return <div>{loading ? null : <Outlet />}</div>
}

export function currentProjectPath(path: string) {
  const { projectSlug } = useParams<"projectSlug">()
  if (path.startsWith("/")) {
    return `/project/${projectSlug}${path}`
  } else {
    return path
  }
}
