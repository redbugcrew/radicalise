import { Text } from "@mantine/core";
import { DateOnly } from "@urbdyn/date-only";

export default function DateText({ date }: { date: DateOnly | null | string }) {
  if (!date) return null;

  if (typeof date === "string") {
    date = DateOnly.fromString(date);
  }

  const dateTime = new Date(date.year, date.month - 1, date.day);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const formattedDate = dateTime.toLocaleDateString("en-US", options);
  return <Text span>{formattedDate}</Text>;
}
