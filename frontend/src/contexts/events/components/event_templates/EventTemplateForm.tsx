import { useForm } from "@mantine/form";
import { Button, Stack, TextInput } from "@mantine/core";
import type { EventTemplateCreationData } from "../../../../api/Api";
import { LinksInput } from "../../../../components";

interface EventTemplateFormProps {
  value?: EventTemplateCreationData | null;
  onSubmit: (data: EventTemplateCreationData) => Promise<void>;
}

export default function EventTemplateForm({ value, onSubmit }: EventTemplateFormProps) {
  const form = useForm<EventTemplateCreationData>({
    mode: "controlled",
    initialValues: value || {
      name: "",
      links: [],
    },
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
