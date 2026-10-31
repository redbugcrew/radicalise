import { useEffect, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import { loadInitialProjectData } from "../store"
import { SelectedProjectContext, type SelectedProjectData } from "./LoadSelectedProject"

export default function LoadProjectState() {
  return (
    <SelectedProjectContext.Consumer>
      {(projectData) => projectData && <LoadProjectStateInner projectData={projectData} />}
    </SelectedProjectContext.Consumer>
  )
}

interface LoadProjectStateInnerProps {
  projectData: SelectedProjectData
}

function LoadProjectStateInner({ projectData }: LoadProjectStateInnerProps) {
  const [loading, setLoading] = useState(true)

  console.log("LoadProjectStateInner", projectData.project.slug)

  useEffect(() => {
    console.log("Loading project with slug:", projectData.project.slug)

    loadInitialProjectData(projectData.project.id).then(() => setLoading(false))
  }, [projectData.project.slug, projectData.canAccess])

  return <div>{loading ? null : <Outlet />}</div>
}

export function currentProjectPath(path: string, projectSlug?: string) {
  if (path.startsWith("/") && projectSlug) {
    return `/project/${projectSlug}${path}`
  } else {
    return path
  }
}

export function useCurrentProjectSlug(): string | undefined {
  const { projectSlug } = useParams<"projectSlug">()
  return projectSlug
}
