import { Stack } from "@mantine/core";
import type { AttendanceIntention, CalendarEvent } from "../../../api/Api";
import EventCard from "./EventCard/EventCard";
import { getApi } from "../../../api";

interface EventsListProps {
  events: CalendarEvent[];
}

export default function EventsList({ events }: EventsListProps) {
  const onIntentionChange = async (eventId: number, intention: AttendanceIntention | null): Promise<void> => {
    console.log(`Event ID: ${eventId}, New Intention: ${intention}`);

    getApi()
      .api.createCalendarEventAttendance({
        calendar_event_id: eventId,
        intention: intention,
      })
      .catch((error) => {
        console.error("Failed to update attendance intention:", error);
      });
  };

  return (
    <Stack>
      {events.map((event) => (
        <EventCard key={event.id} event={event} myIntention={{ intention: undefined, onChange: (intention) => onIntentionChange(event.id, intention) }} />
      ))}
    </Stack>
  );
}
