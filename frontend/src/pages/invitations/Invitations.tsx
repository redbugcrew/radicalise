import { Container, Stack, Title } from "@mantine/core";
import { useAppSelector } from "../../store";
import { InvitationTable } from "../../components";

export default function Invitations() {
  const eois = useAppSelector((state) => state.eois);

  return (
    <Container>
      <Stack gap="lg">
        <Title order={1}>Invitations</Title>
        <InvitationTable eois={eois} />
      </Stack>
    </Container>
  );
}
