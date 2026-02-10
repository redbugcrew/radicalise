import { Card, Group, Stack, Title } from "@mantine/core";
import type { CalendarEvent } from "../../../../api/Api";
import styles from "./EventCard.module.css";
import { Anchor, LinksStack, TimeRangeText } from "../../../../components";
import MyAttendance from "../MyAttendance";
import EventAttendanceTotals from "../EventAttendanceTotals";

interface EventCardProps {
  event: CalendarEvent;
  showParticipantCounts?: boolean;
  interactive?: boolean;
}

export default function EventCard({ event, showParticipantCounts, interactive }: EventCardProps) {
  const cardStyles = [styles.card];

  const card = (
    <Card className={cardStyles.join(" ")}>
      <Card.Section p="md" className={styles.cardTextSection}>
        <Stack>
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Title order={2} size="h4">
                {event.name}
              </Title>
              <TimeRangeText startAt={event.start_at} endAt={event.end_at} />
              <LinksStack links={event.links} />
            </Stack>

            <MyAttendance event={event} readonly={!interactive} />
          </Group>
          {showParticipantCounts && <EventAttendanceTotals event={event} />}
        </Stack>
      </Card.Section>
    </Card>
  );

  if (interactive) {
    return card;
  } else {
    return (
      <Anchor href={`/events/${event.id}`} className={styles.cardLink}>
        {card}
      </Anchor>
    );
  }
}
