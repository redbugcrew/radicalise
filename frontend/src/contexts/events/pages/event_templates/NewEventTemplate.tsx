import { Container, Title, Stack } from "@mantine/core";
import EventTemplateForm from "../../components/event_templates/EventTemplateForm";
import { getApi } from "../../../../api";
import type { EventTemplate } from "../../../../api/Api";
import { handleAppEvents } from "../../../../store";

export default function NewEventTemplate() {
  const navigate = useNavigate();

  const handleSubmit = async (data: EventTemplate): Promise<void> => {
    return getApi()
      .api.createEventTemplate(data)
      .then((response) => {
        handleAppEvents(response.data);
        navigate("/events/event_templates");
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
