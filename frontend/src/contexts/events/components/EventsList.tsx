import { Stack } from "@mantine/core";
import type { CalendarEvent } from "../../../api/Api";

interface EventsListProps {
  events: CalendarEvent[];
}

export default function EventsList({ events }: EventsListProps) {
  return (
    <Stack>
      {events.map((event) => (
        <div key={event.id}>
          <strong>{event.name}</strong> - {new Date(event.start_at).toLocaleString()}
        </div>
      ))}
    </Stack>
  );
}
