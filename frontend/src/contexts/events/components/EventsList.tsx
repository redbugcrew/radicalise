import { Stack } from "@mantine/core";
import type { CalendarEvent } from "../../../api/Api";
import EventCard from "./EventCard/EventCard";

interface EventsListProps {
  events: CalendarEvent[];
}

export default function EventsList({ events }: EventsListProps) {
  return (
    <Stack>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </Stack>
  );
}
