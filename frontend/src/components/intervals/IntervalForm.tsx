import { useForm } from "@mantine/form";
import { Button, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { dateFns } from "iso-fns";
import type { Iso } from "iso-fns";
import type { Interval } from "../../api/Api";
import { formDateFormat } from "../../utilities/date";

export interface IntervalInput {
  id: number | null;
  start_date: Iso.Date | null;
  end_date: Iso.Date | null;
}

export function lastIntervalToInput(interval: Interval | null | undefined): IntervalInput | null {
  if (!interval) return null;
  return {
    id: null,
    start_date: dateFns.add(interval.end_date as Iso.Date, { days: 1 }),
    end_date: null,
  } as IntervalInput;
}

interface IntervalFormProps {
  value?: IntervalInput | null;
  minDate?: Iso.Date | null;
}

export default function IntervalForm({ value, minDate }: IntervalFormProps) {
  const form = useForm({
    mode: "controlled",
    initialValues:
      value ||
      ({
        id: 0,
        start_date: dateFns.now(),
        end_date: null,
      } as IntervalInput),
    validate: {
      start_date: (value) => {
        if (!value) return "Start date is required";
        if (minDate && dateFns.isBefore(value, minDate)) return `Start date must be after ${dateFns.format(minDate, formDateFormat)}`;
        return null;
      },
      end_date: (value, values) => {
        if (!value) return "End date is required";
        if (value && values.start_date && !dateFns.isAfter(value, values.start_date)) return "End date must be after start date";
        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <Stack gap="lg">
        <Stack gap="md">
          <DateInput label="Start date" {...form.getInputProps("start_date")} />
          <DateInput label="End date" {...form.getInputProps("end_date")} />
        </Stack>
        <Button type="submit">Create interval</Button>
      </Stack>
    </form>
  );
}
