import { Container, Stack, Title, Box, Group } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { EntryPathway } from "../../api/Api";
import { Anchor } from "../../components";
import { IconArrowLeft } from "@tabler/icons-react";
import EntryPathwayFields from "../../components/entry_pathways/EntryPathwayFields";

export default function DisplayEntryPathway() {
  const { entryPathwayId } = useParams<"entryPathwayId">();
  const entryPathwayIdNum = parseInt(entryPathwayId || "", 10);
  const entryPathway: EntryPathway | undefined = useAppSelector((state) => state.entryPathways.find((entryPathway) => entryPathway.id === entryPathwayIdNum));

  if (!entryPathway) {
    return (
      <Container>
        <Title order={2}>Entry Pathway not found</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Stack gap="lg">
        <Box>
          <Title order={1}>Entry Pathway</Title>
          <Title order={2}>Expression of Interest</Title>
        </Box>
        <EntryPathwayFields entryPathway={entryPathway} />
        <Anchor href="/entry_pathways">
          <Group gap="sm">
            <IconArrowLeft /> Back to Entry Pathways
          </Group>
        </Anchor>
      </Stack>
    </Container>
  );
}
