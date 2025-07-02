import { useForm } from "@mantine/form";
import type { Interval } from "../../api/Api";
import { Button, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";

export default function IntervalForm() {
  const form = useForm({
    initialValues: {
      id: 0,
      start_date: "",
      end_date: "",
    } as Interval,
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <Stack gap="lg">
        <Stack gap="md">
          <DateInput label="Start date" required {...form.getInputProps("start_date")} />
          <DateInput label="End date" required {...form.getInputProps("end_date")} />
        </Stack>
        <Button type="submit">Create interval</Button>
      </Stack>
    </form>
  );
}
