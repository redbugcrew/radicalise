import { Card, Container, Stack, Title, Text } from "@mantine/core";
import { EOIForm, Markdown } from "../components";
import { useParams } from "react-router-dom";
import { getApi } from "../api";
import { useEffect, useState } from "react";

import type { Collective, Eoi } from "../api/Api";

export default function EOIPage() {
  const { collectiveSlug } = useParams<"collectiveSlug">();

  if (!collectiveSlug) return <Container>Error: Collective not found</Container>;

  const [collective, setCollective] = useState<undefined | null | Collective>(undefined);
  const [eoi, setEoi] = useState<Eoi | null>(null);

  useEffect(() => {
    getApi()
      .api.getCollectiveBySlug(collectiveSlug)
      .then((response) => {
        if (response.status === 200) {
          setCollective(response.data);
        } else if (response.status === 404) {
          setCollective(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching collective:", error);
        setCollective(null);
      });
  }, [collectiveSlug]);

  if (collective === null) {
    return <Container>Collective not found</Container>;
  }
  if (collective === undefined) {
    return <Container>Loading...</Container>;
  }

  if (collective.feature_eoi !== true) {
    return <Container>Expression of Interest is not enabled for this collective.</Container>;
  }

  const handleSubmit = (values: Eoi): Promise<void> => {
    return getApi()
      .api.createEoi(values)
      .then((response) => {
        if (response.status === 201) {
          setEoi(values);
        } else {
          console.error("Error submitting EOI:", response);
        }
      })
      .catch((error) => {
        console.error("Error submitting EOI:", error);
      });
  };

  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Expression of Interest</Title>
          <Title order={2} c="dimmed">
            {collective.name}
          </Title>
        </Stack>

        {eoi && (
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Thank you for your interest!</Title>
              <Text>
                You will receive a confirmation email to{" "}
                <Text span ff="monospace" fw="bold">
                  {eoi.email}
                </Text>{" "}
                which contains links to edit or withdraw your interest.
              </Text>
            </Stack>
          </Card>
        )}

        {!eoi && (
          <>
            <Markdown children={collective.eoi_description} />
            <EOIForm onSubmit={handleSubmit} collective={collective} />
          </>
        )}
      </Stack>
    </Container>
  );
}
