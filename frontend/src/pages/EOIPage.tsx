import { Container, Stack, Title, Text } from "@mantine/core";
import { Anchor, EOIForm } from "../components";
import type { ExpressionOfInterest } from "../components/EOIForm";
import { useParams } from "react-router-dom";
import { getApi } from "../api";
import { useEffect, useState } from "react";
import type { Collective } from "../api/Api";

export default function EOIPage() {
  const { collectiveSlug } = useParams<"collectiveSlug">();

  if (!collectiveSlug) return <Container>Error: Collective not found</Container>;

  const [collective, setCollective] = useState<undefined | null | Collective>(undefined);

  useEffect(() => {
    getApi()
      .api.getCollectiveBySlug(collectiveSlug)
      .then((response) => {
        if (response.status === 200) {
          console.log("Collective data:", response.data);
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

  const handleSubmit = (values: ExpressionOfInterest) => {
    console.log(values);
    // Handle form submission logic here, e.g., send to API
  };

  if (collective === null) {
    return <Container>Collective not found</Container>;
  }
  if (collective === undefined) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Expression of Interest</Title>
          <Title order={2} c="dimmed">
            {collective.name}
          </Title>
        </Stack>

        <Stack gap="md">
          <Text>
            Hi there, you can use this form to express your interest in participating in the Rhubarb Collective. The Rhubarb Collective is not a membership organisation, it's a multi-site housing project driven by an
            emerging group of participants.
          </Text>
          <Text>
            Before expressing your interest, please read about what participating in the Rhubarb Collective involves in <Anchor href="https://radhousing.org/brassica/handbook/participation">our handbook</Anchor>.
          </Text>
          <Text>
            We have a decentralised process for inviting participants who express interest based on our capacity for onboarding new people. The details you provide here will help us reach out to you, if/when any current
            participants have the capacity to support you to get involved in the project.
          </Text>
        </Stack>

        <EOIForm onSubmit={handleSubmit} />
      </Stack>
    </Container>
  );
}
