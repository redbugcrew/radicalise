import { Container, Title, Text, Stack } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApi } from "../../api";
import type { ExpressionOfInterest } from "../../api/Api";
import EntryPathwayFields from "../../components/entry_pathways/EntryPathwayFields";
import { CollectiveContext } from "../PublicWithCollective";
import { EOIForm } from "../../components";

export default function ManageMyEoi() {
  const { authToken } = useParams<"authToken">();
  const collective = useContext(CollectiveContext);
  const [eoi, setEoi] = useState<ExpressionOfInterest | null | undefined>(undefined);

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
          setEoi(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching entry pathway data:", error);
        setEoi(null);
      });
  }, [authToken]);

  if (eoi === undefined) {
    return <Container></Container>;
  }

  if (eoi === null) {
    return (
      <Container pt="lg" pb="xl">
        <Stack mt="lg">
          <Title order={1}>Sorry, we couldn't find that</Title>
          <Text>There was an error fetching your expression of interest.</Text>
        </Stack>
      </Container>
    );
  }

  const handleSubmit = async (values: ExpressionOfInterest): Promise<void> => {
    console.log("Submitted form", values);
  };

  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Manage Expression of Interest</Title>
          <Title order={2} c="dimmed">
            {collective.name}
          </Title>
        </Stack>

        <EntryPathwayFields entryPathway={eoi} />
        <EOIForm onSubmit={handleSubmit} collective={collective} eoi={eoi} />
      </Stack>
    </Container>
  );
}
