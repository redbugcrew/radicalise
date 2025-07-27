import { Container, Stack, Title, Box, Text, Card, Group } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { Eoi } from "../../api/Api";
import { Anchor } from "../../components";
import { IconArrowLeft } from "@tabler/icons-react";

function ResponseField({ label, description, value }: { label: string; description?: string; value?: string | null }) {
  return (
    <Box>
      <Title order={2} size="h4">
        {label}
      </Title>
      {description && <Text color="dimmed">{description}</Text>}
      {value && (
        <Card mt="sm" withBorder>
          {value}
        </Card>
      )}
    </Box>
  );
}

export default function Invitation() {
  const { invitationId } = useParams<"invitationId">();
  const invitationIdNum = parseInt(invitationId || "", 10);
  const invitation: Eoi | undefined = useAppSelector((state) => state.eois.find((eoi) => eoi.id === invitationIdNum));

  if (!invitation) {
    return (
      <Container>
        <Title order={2}>Invitation not found</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Stack gap="lg">
        <Box>
          <Title order={1}>Invitation Details</Title>
          <Title order={2}>Expression of Interest</Title>
        </Box>
        <Stack gap="lg">
          <ResponseField label="Name" value={invitation.name} />
          <ResponseField label="Interest" description="What interests you about participating in the Brassica Collective?" value={invitation.interest} />
          <ResponseField
            label="Context"
            description="What areas that the the Brassica Collective is involved in are you already familiar with, and which ones are ones you're interested in learning more about?"
            value={invitation.context}
          />
          <ResponseField label="How did you hear about us?" description="Where did you hear about the the Brassica Collective?" value={invitation.referral} />
          <ResponseField
            label="Practicing transformative justice"
            description="Recognising that we all have the capacity to cause and experience harm - is there anything you would like to share about your experiences of learning and healing from conflict?"
            value={invitation.conflict_experience}
          />
          <ResponseField label="Participant connections" description="Are there any connections to other Brassica Collective participants that you'd like to tell us about?" value={invitation.participant_connections} />
        </Stack>
        <Anchor href="/invitations">
          <Group gap="sm">
            <IconArrowLeft /> Back to Invitations
          </Group>
        </Anchor>
      </Stack>
    </Container>
  );
}
