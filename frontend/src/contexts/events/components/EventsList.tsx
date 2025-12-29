import { Stack } from "@mantine/core";
import type { AttendanceIntention, CalendarEvent } from "../../../api/Api";
import EventCard from "./EventCard/EventCard";

interface EventsListProps {
  events: CalendarEvent[];
}

export default function EventsList({ events }: EventsListProps) {
  const onIntentionChange = async (eventId: number, intention: AttendanceIntention | null) => {
    console.log(`Event ID: ${eventId}, New Intention: ${intention}`);
  };

  return (
    <Stack>
      {events.map((event) => (
        <EventCard key={event.id} event={event} myIntention={{ intention: undefined, onChange: (intention) => onIntentionChange(event.id, intention) }} />
      ))}
    </Stack>
  );
}
