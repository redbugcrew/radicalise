import { Container, Stack, Title } from "@mantine/core";
import { EOIForm, Markdown } from "../components";
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

  if (collective.feature_eoi !== true) {
    return <Container>Expression of Interest is not enabled for this collective.</Container>;
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

        <Markdown children={collective.eoi_description} />

        <EOIForm onSubmit={handleSubmit} collective={collective} />
      </Stack>
    </Container>
  );
}
