import { Container, Title, Text, Stack } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApi } from "../../api";
import type { EntryPathway } from "../../api/Api";
import EntryPathwayFields from "../../components/entry_pathways/EntryPathwayFields";
import { CollectiveContext } from "../PublicWithCollective";

export default function ManageMyEoi() {
  const { authToken } = useParams<"authToken">();
  const collective = useContext(CollectiveContext);

  const [entryPathway, setEntryPathway] = useState<EntryPathway | null | undefined>(undefined);

  useEffect(() => {
    if (!authToken) {
      console.error("No auth token provided in the URL parameters.");
      return;
    }

    getApi()
      .api.getEntryPathwayByAuthToken(authToken, collective.id)
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

  if (entryPathway === undefined) {
    return <Container></Container>;
  }

  if (entryPathway === null) {
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
