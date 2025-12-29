import { Card, Title, Text } from "@mantine/core";
import type { CalendarEvent } from "../../../../api/Api";
import styles from "./EventCard.module.css";
import { TimeRangeText } from "../../../../components";

interface EventCardProps {
  event: CalendarEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const cardStyles = [styles.card];

  return (
    <Card className={cardStyles.join(" ")}>
      <Title order={2}>{event.name}</Title>
      <TimeRangeText startAt={event.start_at} endAt={event.end_at} />
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
    </Card>
  );
}
