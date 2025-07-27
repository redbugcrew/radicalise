import { Container, Stack, Title } from "@mantine/core";
import { useAppSelector } from "../store";
import { EoiTable } from "../components";

export default function EOIs() {
  const eois = useAppSelector((state) => state.eois);

  return (
    <Container>
      <Stack gap="lg">
        <Title order={1}>Expressions of Interest</Title>
        <EoiTable eois={eois} />
      </Stack>
    </Container>
  );
}
