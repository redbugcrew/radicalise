import { getApi } from "../../../api";
import type { AttendanceIntention, CalendarEvent } from "../../../api/Api";
import { handleAppEvents, useAppSelector } from "../../../store";
import AttendanceSelector from "./AttendanceSelector";

interface MyAttendanceSelectorProps {
  event: CalendarEvent;
  readonly?: boolean;
}

export default function MyAttendance({ event, readonly }: MyAttendanceSelectorProps) {
  const currentPersonId = useAppSelector((state) => state.me?.person_id);

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

  let myIntention = undefined;
  if (currentPersonId !== undefined) {
    myIntention = {
      intention: intentionForEvent(currentPersonId, event),
      onChange: (intention: AttendanceIntention | null) => onIntentionChange(event.id, intention),
    };
  }

  return <AttendanceSelector {...myIntention} readonly={readonly} />;
}

function intentionForEvent(personId: number, event: CalendarEvent): AttendanceIntention | null | undefined {
  if (!event.attendances) return undefined;
  const attendancesForPerson = event.attendances.find((attendance) => attendance.person_id === personId);
  return attendancesForPerson?.intention;
}
