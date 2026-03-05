import { createContext, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import type { Project } from "../api/Api";
import { getApi } from "../api";
import { Container, Stack, Title, Text } from "@mantine/core";

const dummyProject: Project = {
  feature_eoi: false,
  id: -1,
  links: [],
};
export const ProjectContext = createContext<Project>(dummyProject);

export default function PublicWithProject() {
  const { projectSlug } = useParams<"projectSlug">();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (!projectSlug) {
      console.error("No project slug provided in the URL parameters.");
      return;
    }

    getApi()
      .api.getProjectBySlug(projectSlug)
      .then((response) => {
        if (response.status === 200) {
          setProject(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching project data:", error);
        setProject(null);
      });
  }, [projectSlug]);

  if (project === undefined) return null;

  if (project === null)
    return (
      <Container pt="lg" pb="xl">
        <Stack mt="lg">
          <Title order={1}>Sorry, we couldn't find that project</Title>
          <Text>There was an error fetching the project "{projectSlug}".</Text>
        </Stack>
      </Container>
    );

  return (
    <ProjectContext value={project}>
      <Outlet />
    </ProjectContext>
  );
}
