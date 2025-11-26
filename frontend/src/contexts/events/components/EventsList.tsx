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
          {event.links && event.links.length > 0 && (
            <ul>
              {event.links.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </Stack>
  );
}
