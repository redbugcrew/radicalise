import { Container, Stack, Tabs, Title } from "@mantine/core";
import PeopleTable from "../components/PeopleTable";
import { IconTools, IconHeart, IconArchive } from "@tabler/icons-react";

export default function People() {
  const iconSize = 16;

  return (
    <Container p={0}>
      <Stack>
        <Title order={1}>People</Title>
        <Tabs defaultValue="participants">
          <Tabs.List>
            <Tabs.Tab value="participants">Participants</Tabs.Tab>
            <Tabs.Tab value="supporters">Supporters</Tabs.Tab>
            <Tabs.Tab value="archived">Archived</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="participants" pt="md">
            <PeopleTable />
          </Tabs.Panel>

          <Tabs.Panel value="supporters" pt="md">
            Supporters tab content
          </Tabs.Panel>

          <Tabs.Panel value="archived" pt="md">
            Archived tab content
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
