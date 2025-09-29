import { Container, Title, Stack } from "@mantine/core";
import EventForm, { type Event } from "../components/EventForm";
import { useAppSelector } from "../../../store";

export default function NewEventTemplate() {
  const eventTemplates = useAppSelector((state) => state.eventTemplates);
  //const navigate = useNavigate();

  const handleSubmit = async (data: Event): Promise<void> => {
    // return getApi()
    //   .api.createEventTemplate(data)
    //   .then((response) => {
    //     handleAppEvents(response.data);
    //     navigate("/events/event_templates");
    //   })
    //   .catch((error) => {
    //     console.error("Error creating event template:", error);
    //   });
  };

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Event</Title>

        {eventTemplates.length === 0 && <p>No event templates available. Please create one first.</p>}

        {eventTemplates.length > 0 && <EventForm onSubmit={handleSubmit} eventTemplates={eventTemplates} />}
      </Stack>
    </Container>
  );
}
