import { Tooltip } from "@mantine/core";
import { AttendanceIntention, type CalendarEventAttendance } from "../../../api/Api";
import { IconCheck, IconCircleCheck, IconCircleDashed, IconCircleDashedCheck, IconCircleDashedX, IconCircleX } from "@tabler/icons-react";

export default function PersonEventAttendanceIcon({ attendance }: { attendance: CalendarEventAttendance | undefined }): React.ReactNode {
  const intention = attendance?.intention;
  const actual = attendance?.actual;

  const iconSize = 22;

  if (actual === true) {
    if (intention === AttendanceIntention.Going) {
      return (
        <Tooltip label="RSVP'd going and attended">
          <IconCircleCheck color="green" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === AttendanceIntention.NotGoing) {
      return (
        <Tooltip label="RSVP'd not going but attended">
          <IconCircleDashedCheck color="green" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === AttendanceIntention.Uncertain) {
      return (
        <Tooltip label="RSVP'd uncertain and attended">
          <IconCheck color="green" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === null || intention === undefined) {
      return (
        <Tooltip label="Did not RSVP but did attend">
          <IconCheck color="green" size={iconSize} />
        </Tooltip>
      );
    }
  } else if (actual === false) {
    if (intention === AttendanceIntention.Going) {
      return (
        <Tooltip label="RSVP'd going but didn't attend">
          <IconCircleX color="red" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === AttendanceIntention.NotGoing) {
      return (
        <Tooltip label="RSVP'd not going and didn't attend">
          <IconCircleX color="orange" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === AttendanceIntention.Uncertain) {
      return (
        <Tooltip label="RSVP'd uncertain and didn't attend">
          <IconCircleX color="orange" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === null || intention === undefined) {
      return (
        <Tooltip label="Did not RSVP and didn't attend">
          <IconCircleDashedX color="orange" size={iconSize} />
        </Tooltip>
      );
    }
  } else if (actual === null || actual === undefined) {
    if (intention === AttendanceIntention.Going) {
      return (
        <Tooltip label="RSVP'd going and no attendance recorded">
          <IconCircleX color="red" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === AttendanceIntention.NotGoing) {
      return (
        <Tooltip label="RSVP'd not going and no attendance recorded">
          <IconCircleX color="orange" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === AttendanceIntention.Uncertain) {
      return (
        <Tooltip label="RSVP'd uncertain and no attendance recorded">
          <IconCircleX color="orange" size={iconSize} />
        </Tooltip>
      );
    } else if (intention === null || intention === undefined) {
      return (
        <Tooltip label="Did not RSVP and no attendance recorded">
          <IconCircleDashed color="grey" size={iconSize} />
        </Tooltip>
      );
    }
  }
}
