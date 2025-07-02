import { parseISO } from "date-fns";

export function dateStringToDateTime(dateString: string | null): Date | null {
  if (!dateString) return null;
  return parseISO(dateString);
}
