import { Container, Title } from "@mantine/core";
import { IntervalForm } from "../../components";

export default function NewInterval() {
  return (
    <Container>
      <Title order={1} mb="md">
        New Interval
      </Title>
      <IntervalForm />
    </Container>
  );
}
