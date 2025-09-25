import { Container, Title, Stack } from "@mantine/core";
import EventTemplateForm from "../../components/event_templates/EventTemplateForm";
import { getApi } from "../../../../api";
import type { EventTemplate } from "../../../../api/Api";

export default function NewEventTemplate() {
  const handleSubmit = async (data: EventTemplate): Promise<void> => {
    return getApi()
      .api.createEventTemplate(data)
      .then(() => {
        console.log("Event template created successfully");
      })
      .catch((error) => {
        console.error("Error creating event template:", error);
      });
  };

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Event Template</Title>
        <EventTemplateForm onSubmit={handleSubmit} />
      </Stack>
    </Container>
  );
}
