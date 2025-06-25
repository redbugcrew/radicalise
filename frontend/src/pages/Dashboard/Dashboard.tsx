import { Button, Card, Container, Title, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container>
      <Title order={1} mb="md">
        My Dashboard
      </Title>
      <Stack gap="md">
        <Card>
          <Title order={2} size="md" mb="xs">
            This interval
          </Title>
          <Text>¯\_(ツ)_/¯</Text>
        </Card>

        <Card>
          <Title order={2} size="md">
            Next interval
          </Title>
          <Button fullWidth mt="md" radius="md" onClick={() => navigate("/my_participation/3")}>
            Plan your participation
          </Button>
        </Card>
      </Stack>
    </Container>
  );
}
