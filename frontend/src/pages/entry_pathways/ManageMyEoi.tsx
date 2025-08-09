import { Container, Title, Text, Stack, Card, Button } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApi } from "../../api";
import type { EoiError, ExpressionOfInterest } from "../../api/Api";
import { CollectiveContext } from "../PublicWithCollective";
import { EOIForm } from "../../components";

export default function ManageMyEoi() {
  const { authToken } = useParams<"authToken">();
  const collective = useContext(CollectiveContext);
  const [eoi, setEoi] = useState<ExpressionOfInterest | null | undefined>(undefined);
  const [error, setError] = useState<EoiError | null>(null);

  useEffect(() => {
    if (!authToken) {
      console.error("No auth token provided in the URL parameters.");
      return;
    }

    getApi()
      .api.getEoiByAuthToken(authToken, collective.id)
      .then((response) => {
        if (response.status === 200) {
          console.log("EOI data:", response.data);
          setEoi(response.data);
          setError(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching EOI data:", error);
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
    if (!authToken) {
      console.error("No auth token provided for updating EOI.");
      return;
    }

    return getApi()
      .api.updateEoi(authToken, collective.id, values)
      .then((_) => {
        setError(null);
        setEoi(values);
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          const errorEnum = error.response.data as EoiError;
          setError(errorEnum);
        }
      });
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

        {error && (
          <Card withBorder style={{ borderColor: "var(--mantine-color-red-5)" }}>
            <Stack gap="md">
              <Title order={3}>Sorry, there was an error with your submission</Title>
              <Text>Something is broken on our end. Please try again later, or contact the collective via other means.</Text>
            </Stack>
          </Card>
        )}

        <Stack align="flex-start">
          <Title order={3}>Delete your submission</Title>
          <Text>If you delete your submission, your data will be permanently removed and cannot be recovered. You can always re-submit later if you change your mind.</Text>
          <Button color="red">Delete</Button>
        </Stack>

        <Stack>
          <Title order={3}>Update your answers</Title>
          <Text>You can update your answers below, any changes here will override what you have already submitted.</Text>
          <EOIForm onSubmit={handleSubmit} collective={collective} eoi={eoi} actionName="Update" />
        </Stack>
      </Stack>
    </Container>
  );
}
