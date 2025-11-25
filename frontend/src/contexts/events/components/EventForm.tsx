import { useForm } from "@mantine/form";
import { Button, Select, Stack, TextInput } from "@mantine/core";
import { LinksInput } from "../../../components";
import type { CalendarEvent, EventTemplate, Link } from "../../../api/Api";
import { DatePickerInput, DateTimePicker, TimeInput, TimePicker } from "@mantine/dates";

interface CalendarEventFormData {
  id: number;
  event_template_id: number | null;
  links?: any[] | null;
  name: string | null;
  start_at: string | null;
  end_at?: string | null;
}

interface EventTemplateFormProps {
  value?: CalendarEvent | null;
  eventTemplates: EventTemplate[];
  onSubmit: (data: CalendarEvent) => Promise<void>;
}

const defaultEvent: CalendarEventFormData = {
  id: -1,
  event_template_id: -1,
  name: "",
  start_at: null,
  links: [] as Link[],
};

export default function EventTemplateForm({ value, eventTemplates, onSubmit }: EventTemplateFormProps) {
  const form = useForm<CalendarEventFormData>({
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

  const onSubmitFormData = (data: CalendarEventFormData) => {
    onSubmit(data as CalendarEvent);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmitFormData, (errors) => console.log("Form submission errors:", errors))}>
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

          <DatePickerInput label="Start date" placeholder="Pick date" key={form.key("start_at")} {...form.getInputProps("start_at")} />

          <TimePicker label="Start time" format="12h" key={form.key("start_at")} {...form.getInputProps("start_at")} />

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
