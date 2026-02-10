import { useForm } from "@mantine/form";
import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { EventResponseExpectation, type EventTemplate } from "../../../../api/Api";
import { LinksInput } from "../../../../components";

interface EventTemplateFormProps {
  value?: EventTemplate | null;
  onSubmit: (data: EventTemplate) => Promise<void>;
}

const defaultInitialValue: EventTemplate = {
  id: -1,
  name: "",
  summary: "",
  response_expectation: EventResponseExpectation.Welcome,
  links: [],
};

export default function EventTemplateForm({ value, onSubmit }: EventTemplateFormProps) {
  const form = useForm<EventTemplate>({
    mode: "controlled",
    initialValues: { ...defaultInitialValue, ...value },
    validate: {
      name: (value) => (value && value.trim().length > 0 ? null : "Name is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput
            label="Name"
            description="The name of the template. This is usually how you refer to this type of event. As in, we're going to have a SOMETHING this weekend. It needs to be unique within your collective, so if you have multiple types of meetings, be more specific."
            placeholder="e.g. Training, Meeting, Action, Party, Assembly, etc"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Summary"
            description="A brief, optional, summary of the template. This should give a quick overview of what this type of event is about."
            placeholder="e.g. This is the main meeting where we make decisions together as a group."
            {...form.getInputProps("summary")}
          />

          <NativeSelect
            label="Response Expectation"
            description="What expectation does the group have that invitees will respond to this type of event?"
            data={Object.values(EventResponseExpectation)}
            {...form.getInputProps("response_expectation")}
          />

          <LinksInput
            label="Links"
            description="Add links to resources on this type of event in general. Ie; how we run meetings, not the agenda for a specific meeting"
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
