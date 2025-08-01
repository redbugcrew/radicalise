import { Box, Card, Stack, Title, Text } from "@mantine/core";
import type { EntryPathway } from "../../api/Api";

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

export default function EntryPathwayFields({ entryPathway }: { entryPathway: EntryPathway }) {
  return (
    <Stack gap="lg">
      <ResponseField label="Name" value={entryPathway.name} />
      <ResponseField label="Interest" description="What interests you about participating in the Brassica Collective?" value={entryPathway.interest} />
      <ResponseField
        label="Context"
        description="What areas that the the Brassica Collective is involved in are you already familiar with, and which ones are ones you're interested in learning more about?"
        value={entryPathway.context}
      />
      <ResponseField label="How did you hear about us?" description="Where did you hear about the the Brassica Collective?" value={entryPathway.referral} />
      <ResponseField
        label="Practicing transformative justice"
        description="Recognising that we all have the capacity to cause and experience harm - is there anything you would like to share about your experiences of learning and healing from conflict?"
        value={entryPathway.conflict_experience}
      />
      <ResponseField label="Participant connections" description="Are there any connections to other Brassica Collective participants that you'd like to tell us about?" value={entryPathway.participant_connections} />
    </Stack>
  );
}
