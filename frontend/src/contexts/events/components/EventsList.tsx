import { Stack } from "@mantine/core";
import type { AttendanceIntention, CalendarEvent } from "../../../api/Api";
import EventCard from "./EventCard/EventCard";
import { getApi } from "../../../api";
import { handleAppEvents } from "../../../store";

interface EventsListProps {
  events: CalendarEvent[];
  currentPersonId: number | undefined;
}

export default function EventsList({ events, currentPersonId }: EventsListProps) {
  const onIntentionChange = async (eventId: number, intention: AttendanceIntention | null): Promise<void> => {
    console.log(`Event ID: ${eventId}, New Intention: ${intention}`);

    getApi()
      .api.createCalendarEventAttendance({
        calendar_event_id: eventId,
        intention: intention,
      })
      .then((response) => {
        handleAppEvents(response.data);
      })
      .catch((error) => {
        console.error("Failed to update attendance intention:", error);
      });
  };

  return (
    <Stack>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          myIntention={currentPersonId !== undefined ? { intention: intentionForEvent(currentPersonId, event), onChange: (intention) => onIntentionChange(event.id, intention) } : undefined}
        />
      ))}
    </Stack>
  );
}

function intentionForEvent(personId: number, event: CalendarEvent): AttendanceIntention | null | undefined {
  if (!event.attendances) return undefined;
  const attendancesForPerson = event.attendances.find((attendance) => attendance.person_id === personId);
  return attendancesForPerson?.intention;
}
