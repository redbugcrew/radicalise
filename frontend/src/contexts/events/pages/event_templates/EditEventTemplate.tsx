import { Container, Title, Stack } from "@mantine/core";
import EventTemplateForm from "../../components/event_templates/EventTemplateForm";
import type { EventTemplate } from "../../../../api/Api";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../../store";
import { getApi } from "../../../../api";

export default function EditEventTemplate() {
  const { templateId } = useParams<"templateId">();
  const templateIdNum = templateId ? parseInt(templateId, 10) : undefined;
  const template = useAppSelector((state) => state.eventTemplates.find((t) => t.id === templateIdNum));

  if (!templateIdNum || !template) {
    return (
      <Container>
        <Title order={2}>Event Template not found</Title>
        <p>The event template you are trying to edit does not exist.</p>
      </Container>
    );
  }

  const handleSubmit = async (data: EventTemplate): Promise<void> => {
    return getApi()
      .api.updateEventTemplate(templateIdNum.toString(), data)
      .then(() => {
        console.log("Event template updated successfully");
      })
      .catch((error) => {
        console.error("Error updating event template:", error);
      });
  };

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>Edit Event Template</Title>
        <EventTemplateForm onSubmit={handleSubmit} value={template} />
      </Stack>
    </Container>
  );
}
