import { getApi } from "../../../api";
import type { AttendanceIntention, CalendarEvent } from "../../../api/Api";
import { PersonBadge } from "../../../components";
import { handleAppEvents, useAppSelector } from "../../../store";
import AttendanceSelector from "./AttendanceSelector";

interface MyAttendanceSelectorProps {
  event: CalendarEvent;
  readonly?: boolean;
}

export default function MyAttendance({ event, readonly }: MyAttendanceSelectorProps) {
  const currentPerson = useAppSelector((state) => state.me?.person_id && state.people[state.me?.person_id]);

  if (!currentPerson) return null;

  const intention = intentionForEvent(currentPerson.id, event);

  if (readonly) {
    return <PersonBadge person={currentPerson} textOverride={intention ? intention : "No Response"} />;
  }

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

  let myIntention = {
    intention: intention,
    onChange: (intention: AttendanceIntention | null) => onIntentionChange(event.id, intention),
  };

  return <AttendanceSelector {...myIntention} />;
}

function intentionForEvent(personId: number, event: CalendarEvent): AttendanceIntention | null | undefined {
  if (!event.attendances) return undefined;
  const attendancesForPerson = event.attendances.find((attendance) => attendance.person_id === personId);
  return attendancesForPerson?.intention;
}
