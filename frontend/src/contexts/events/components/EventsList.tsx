import { Stack } from "@mantine/core";
import type { CalendarEvent } from "../../../api/Api";
import EventCard from "./EventCard/EventCard";
import { NoData } from "../../../components";
import type React from "react";
import { compareAsc } from "date-fns";

interface EventsListProps {
  events: CalendarEvent[];
  noDataMessage?: React.ReactNode;
  showParticipantCounts?: boolean;
}

export default function EventsList({ events, noDataMessage, showParticipantCounts }: EventsListProps) {
  if (events.length === 0) {
    return <NoData>{noDataMessage || "No events found"}</NoData>;
  }

  let sortedEvents = sortEventsByStartDate(events);

  return (
    <Stack>
      {sortedEvents.map((event) => (
        <EventCard key={event.id} event={event} showParticipantCounts={showParticipantCounts} />
      ))}
    </Stack>
  );
}

function sortEventsByStartDate(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => compareAsc(a.start_at, b.start_at));
}
