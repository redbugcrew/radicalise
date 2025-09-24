import { Container, Title, Stack } from "@mantine/core";
import EventTemplateForm from "../../components/event_templates/EventTemplateForm";

export default function NewEventTemplate() {
  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Event Template</Title>
        <EventTemplateForm onSubmit={(data) => console.log("Submitted data:", data)} />
      </Stack>
    </Container>
  );
}
