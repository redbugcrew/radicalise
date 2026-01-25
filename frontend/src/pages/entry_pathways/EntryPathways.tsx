import { Container, Stack, Title, Text } from "@mantine/core";
import { useAppSelector } from "../../store";
import { Anchor, EntryPathwaysTable } from "../../components";

export default function EntryPathways() {
  const entryPathways = useAppSelector((state) => state.entryPathways);
  const collectiveSlug = useAppSelector((state) => state.collective?.slug);

  return (
    <Container>
      <Stack gap="lg">
        <Stack gap="lg">
          <Title order={1}>Entry Pathways</Title>
          <EntryPathwaysTable entryPathways={entryPathways} />
        </Stack>
        <Stack gap={0}>
          {collectiveSlug && (
            <Text c="dimmed">
              These are created using the <Anchor href={`/collective/${collectiveSlug}/interest`}>expression of interest form</Anchor>.
            </Text>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
