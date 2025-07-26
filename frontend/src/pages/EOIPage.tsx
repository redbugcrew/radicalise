import { Container, Stack, Title, Text } from "@mantine/core";
import { Anchor, EOIForm } from "../components";
import type { ExpressionOfInterest } from "../components/EOIForm";

export default function EOIPage() {
  const handleSubmit = (values: ExpressionOfInterest) => {
    console.log(values);
    // Handle form submission logic here, e.g., send to API
  };

  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Expression of Interest</Title>
          <Title order={2} c="dimmed">
            Rhubarb Collective
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
            participants have the capacity to support you to get involved in the projet.
          </Text>
        </Stack>

        <EOIForm onSubmit={handleSubmit} />
      </Stack>
    </Container>
  );
}
