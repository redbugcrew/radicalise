import { endOfDay, isFuture } from "date-fns";
import type { CalendarEvent } from "../../../../api/Api";
import { useAppSelector } from "../../../../store";
import EventsList from "../../components/EventsList";

export default function UpcomingEvents() {
  const events = useAppSelector((state) => filterUpcomingEvents(state.events));

  return <EventsList events={events} noDataMessage="No upcoming events found" />;
}

function filterUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => isFuture(endOfDay(event.start_at)));
}
