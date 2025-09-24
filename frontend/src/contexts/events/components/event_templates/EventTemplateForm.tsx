import { useForm } from "@mantine/form";
import { Button, Stack, TextInput } from "@mantine/core";

export interface EventTemplateInput {
  name: string;
}

interface EventTemplateFormProps {
  value?: EventTemplateInput | null;
  onSubmit: (data: EventTemplateInput) => void;
}

export default function EventTemplateForm({ value, onSubmit }: EventTemplateFormProps) {
  const form = useForm<EventTemplateInput>({
    mode: "controlled",
    initialValues: value || ({} as EventTemplateInput),
    validate: {
      name: (value) => (value && value.trim().length > 0 ? null : "Name is required"),
    },
  });

  const handleSubmit = (values: EventTemplateInput) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput
            label="Name"
            description="The name of the template. This is usually how you refer to this type of event. As in, we're going to have a/an XXX this weekend. It needs to be unique within your collective, so if you have multiple types of meetings, be more specific."
            placeholder="e.g. Training, Meeting, Action, Party, Assembly, etc"
            withAsterisk
            {...form.getInputProps("name")}
          />
        </Stack>
        <Button type="submit">Create template</Button>
      </Stack>
    </form>
  );
}
