import { Text } from "@mantine/core";
import { format, isThisYear, isSameYear, isSameDay } from "date-fns";

interface FormatDateStringProps {
  displayDate?: boolean;
  displayYear?: boolean;
  displayMinutes?: boolean;
}

function formatDateString({ displayDate, displayYear, displayMinutes }: FormatDateStringProps): string {
  let datePart = "";
  if (displayDate) {
    datePart += "MMM d";
    if (displayYear) {
      datePart += " yyy";
    }
  }

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
    };
  }

  const endYearDisplayed = endAt && endAtProps.displayDate && endAtProps.displayYear;

  const startAtProps = {
    displayDate: true,
    displayYear: !isThisYear(startAt) && !(endYearDisplayed && isSameYear(startAt, endAt)),
  };

  return (
    <Text>
      <Text span>{format(startAt, formatDateString(startAtProps))}</Text> <Text span>-</Text> {endAt && <Text span>{format(endAt, formatDateString(endAtProps))}</Text>}
    </Text>
  );
}
