import { Button, Card, Container, Title, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { useNextInterval } from "../../store/intervals";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentInterval } = useAppSelector((state) => state.intervals);
  const nextInterval = useNextInterval();

  return (
    <Container>
      <Title order={1} mb="md">
        My Dashboard
      </Title>
      <Stack gap="md">
        {currentInterval && (
          <Card>
            <Title order={2} size="md" mb="xs">
              This interval {currentInterval.id}
            </Title>
            <Button mt="md" radius="md" onClick={() => navigate(`/my_participation/${currentInterval.id}`)}>
              Update your participation
            </Button>
          </Card>
        )}

        {nextInterval && (
          <Card>
            <Title order={2} size="md">
              Next interval:
              {nextInterval.id}
            </Title>
            <Button mt="md" radius="md" onClick={() => navigate(`/my_participation/${nextInterval.id}`)}>
              Plan your participation
            </Button>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
