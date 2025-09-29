import { useForm } from "@mantine/form";
import { Button, Select, Stack, TextInput } from "@mantine/core";
import { LinksInput } from "../../../components";
import type { EventTemplate, Link } from "../../../api/Api";
import { DatePickerInput, DateTimePicker, TimeInput, TimePicker } from "@mantine/dates";

export interface Event {
  id: number;
  event_template_id: number | null;
  name: string;
  start_date: string | null;
  links?: Link[] | null;
}

interface EventTemplateFormProps {
  value?: Event | null;
  eventTemplates: EventTemplate[];
  onSubmit: (data: Event) => Promise<void>;
}

const defaultEvent = {
  id: -1,
  event_template_id: null,
  name: "",
  start_date: null,
  links: [] as Link[],
};

export default function EventTemplateForm({ value, eventTemplates, onSubmit }: EventTemplateFormProps) {
  const form = useForm<Event>({
    mode: "controlled",
    initialValues: {
      ...defaultEvent,
      ...value,
    },
    validate: {
      event_template_id: (value) => (value ? null : "Event template is required"),
      name: (value) => (value && value.trim().length > 0 ? null : "Name is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <Select
            label="Event Template"
            description=""
            placeholder="Pick value"
            data={eventTemplates.map((template) => ({ label: template.name, value: template.id.toString() }))}
            key={form.key("event_template_id")}
            {...form.getInputProps("event_template_id")}
          />

          <TextInput
            label="Name"
            description="The name of this specific event. If this is a recurring event, you might want to add something to differentiate it."
            placeholder="June Assembly, 2025 Retreat, etc"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <DatePickerInput label="Start date" placeholder="Pick date" key={form.key("start_date")} {...form.getInputProps("start_date")} />

          <TimePicker label="Start time" format="12h" key={form.key("start_time")} {...form.getInputProps("start_time")} />

          <LinksInput
            label="Links"
            description="Links that apply to this specific event. Ie; the agenda for this meeting, the location for this party, etc"
            placeholder="Add a link"
            key="links"
            {...form.getInputProps("links")}
          />
        </Stack>
        <Button type="submit" loading={form.submitting}>
          Create template
        </Button>
      </Stack>
    </form>
  );
}
