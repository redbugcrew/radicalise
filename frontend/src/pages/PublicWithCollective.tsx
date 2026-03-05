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

export default function PublicWithCollective() {
  const { collectiveSlug } = useParams<"collectiveSlug">();
  const [collective, setCollective] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (!collectiveSlug) {
      console.error("No collective slug provided in the URL parameters.");
      return;
    }

    getApi()
      .api.getCollectiveBySlug(collectiveSlug)
      .then((response) => {
        if (response.status === 200) {
          setCollective(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching collective data:", error);
        setCollective(null);
      });
  }, [collectiveSlug]);

  if (collective === undefined) return null;

  if (collective === null)
    return (
      <Container pt="lg" pb="xl">
        <Stack mt="lg">
          <Title order={1}>Sorry, we couldn't find that collective</Title>
          <Text>There was an error fetching the collective "{collectiveSlug}".</Text>
        </Stack>
      </Container>
    );

  return (
    <ProjectContext value={collective}>
      <Outlet />
    </ProjectContext>
  );
}
