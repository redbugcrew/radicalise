import { Container, Stack, Title } from "@mantine/core";
import { useAppSelector } from "../../store";
import { EntryPathwaysTable } from "../../components";

export default function EntryPathways() {
  const entryPathways = useAppSelector((state) => state.entryPathways);

  return (
    <Container>
      <Stack gap="lg">
        <Title order={1}>Entry Pathways</Title>
        <EntryPathwaysTable entryPathways={entryPathways} />
      </Stack>
    </Container>
  );
}
