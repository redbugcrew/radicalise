import { Stack, Title } from "@mantine/core";
import PeopleTable from "../components/PeopleTable";

export default function People() {
  return (
    <Stack>
      <Title order={1}>Participants</Title>
      <PeopleTable />
    </Stack>
  );
}
