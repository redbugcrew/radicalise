import { Container, Title, Text, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApi } from "../../api";
import type { Collective, EntryPathway } from "../../api/Api";
import EntryPathwayFields from "../../components/entry_pathways/EntryPathwayFields";

export default function ManageMyEoi() {
  const { authToken } = useParams<"authToken">();
  const { collectiveSlug } = useParams<"collectiveSlug">();

  const [entryPathway, setEntryPathway] = useState<EntryPathway | null | undefined>(undefined);
  const [collective, setCollective] = useState<Collective | null | undefined>(undefined);

  useEffect(() => {
    if (!authToken) {
      console.error("No auth token provided in the URL parameters.");
      return;
    }

    getApi()
      .api.getEntryPathwayByAuthToken(authToken)
      .then((response) => {
        if (response.status === 200) {
          console.log("Entry pathway data:", response.data);
          setEntryPathway(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching entry pathway data:", error);
        setEntryPathway(null);
      });
  }, [authToken]);

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

  if (entryPathway === undefined || collective === undefined) {
    return <Container></Container>;
  }

  if (entryPathway === null || collective === null) {
    return (
      <Container pt="lg" pb="xl">
        <Stack mt="lg">
          <Title order={1}>Sorry, we couldn't find that</Title>
          <Text>There was an error fetching your expression of interest.</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Manage Expression of Interest</Title>
          <Title order={2} c="dimmed">
            {collective.name}
          </Title>
        </Stack>

        <EntryPathwayFields entryPathway={entryPathway} />
      </Stack>
    </Container>
  );
}
