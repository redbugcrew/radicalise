import { useForm } from "@mantine/form";
import { Button, Select, Stack, TextInput } from "@mantine/core";
import { LinksInput } from "../../../components";
import type { CalendarEvent, EventTemplate, Link } from "../../../api/Api";
import { DateTimePicker } from "@mantine/dates";

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
  event_template_id: null,
  name: "",
  start_at: null,
  links: [] as Link[],
};

function validateDateTime(value: string | null | undefined): string | null {
  if (!value) return "Date and time is required";
  const date = new Date(value);
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
    return "Please specify a time (cannot be 0:00:00)";
  }
  return null;
}

function prepareCalendarEvent(data: CalendarEventFormData): CalendarEvent | null {
  if (!data.event_template_id || !data.name || !data.start_at) {
    return null;
  }

  return {
    ...data,
    event_template_id: parseInt(data.event_template_id.toString(), 10),
    name: data.name,
    start_at: data.start_at,
  };
}

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
      start_at: validateDateTime,
      end_at: (value, values) => {
        const dateTimeError = validateDateTime(value);
        if (dateTimeError) return dateTimeError;

        const startError = validateDateTime(values.start_at);
        if (startError) return null;

        if (value && values.start_at && new Date(value) <= new Date(values.start_at)) {
          return "End time must be after start time";
        }

        return null;
      },
    },
  });

  const onSubmitFormData = (data: CalendarEventFormData) => {
    const preparedEvent = prepareCalendarEvent(data);
    if (preparedEvent) {
      onSubmit(preparedEvent);
    } else {
      console.error("Failed to prepare calendar event from form data:", data);
    }
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

          <DateTimePicker label="Start at" placeholder="Pick a date and time" timePickerProps={{ format: "12h" }} key={form.key("start_at")} {...form.getInputProps("start_at")} />

          <DateTimePicker label="End at" placeholder="Pick a date and time" timePickerProps={{ format: "12h" }} key={form.key("end_at")} {...form.getInputProps("end_at")} />

          <LinksInput
            label="Links"
            description="Links that apply to this specific event. Ie; the agenda for this meeting, the location for this party, etc"
            placeholder="Add a link"
            key="links"
            {...form.getInputProps("links")}
          />
        </Stack>
        <Button type="submit" loading={form.submitting}>
          Create event
        </Button>
      </Stack>
    </form>
  );
}
