import { Text } from "@mantine/core";
import { format, isThisYear, isSameYear, isSameDay } from "date-fns";

interface FormatDateStringProps {
  displayDate?: boolean;
  displayYear?: boolean;
  displayTime?: boolean;
  displayMinutes?: boolean;
}

function formatDateString({ displayDate, displayYear, displayTime, displayMinutes }: FormatDateStringProps): string {
  let datePart = "";
  if (displayDate) {
    datePart += "MMM d";
    if (displayYear) {
      datePart += " yyy";
    }
  }

  if (!displayTime) return datePart;

  let timePart = "h";
  if (displayMinutes) {
    timePart += ":mm";
  }
  timePart += "aaa";

  const parts = [datePart, timePart].filter((part) => part !== "");

  return parts.join(", ");
}

interface TimeRangeTextProps {
  startAt: string;
  endAt: string | null | undefined;
}

export default function TimeRangeText({ startAt, endAt }: TimeRangeTextProps) {
  if (!startAt) return null;

  let endAtProps: FormatDateStringProps = {};
  if (endAt) {
    endAtProps = {
      displayDate: !isSameDay(startAt, endAt),
      displayYear: !isThisYear(endAt),
      displayTime: true,
    };
  }

  const endYearDisplayed = endAt && endAtProps.displayDate && endAtProps.displayYear;

  const startAtProps = {
    displayDate: true,
    displayTime: true,
    displayYear: !isThisYear(startAt) && !(endYearDisplayed && isSameYear(startAt, endAt)),
  };

  return (
    <Text>
      <Text span>{format(startAt, formatDateString(startAtProps))}</Text> <Text span>-</Text> {endAt && <Text span>{format(endAt, formatDateString(endAtProps))}</Text>}
    </Text>
  );
}

export function DateText({ date }: { date: string }) {
  return <Text>{format(date, formatDateString({ displayDate: true, displayYear: true, displayTime: false }))}</Text>;
}
