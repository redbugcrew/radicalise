import { Card, Title } from "@mantine/core";
import type { AttendanceIntention, CalendarEvent } from "../../../../api/Api";
import styles from "./EventCard.module.css";
import { Anchor, TimeRangeText } from "../../../../components";
import AttendanceSelector from "../AttendanceSelector";

interface EventCardProps {
  event: CalendarEvent;
  myIntention?: {
    intention?: AttendanceIntention | null;
    onChange?: (intention: AttendanceIntention | null) => Promise<void>;
  };
}

export default function EventCard({ event, myIntention }: EventCardProps) {
  const cardStyles = [styles.card];

  return (
    <Anchor href={`/events/${event.id}`} className={styles.cardLink}>
      <Card className={cardStyles.join(" ")}>
        <Card.Section p="md" className={styles.cardTextSection}>
          <Title order={2} size="h4">
            {event.name}
          </Title>
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
        </Card.Section>
        {myIntention && (
          <Card.Section p="md" className={styles.cardTextSection}>
            <AttendanceSelector intention={myIntention.intention} onChange={myIntention.onChange} />
          </Card.Section>
        )}
      </Card>
    </Anchor>
  );
}
