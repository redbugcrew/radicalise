import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

interface CircleFormData {
  name: string;
}

interface CircleFormProps {
  onSubmit: (data: CircleFormData) => Promise<void>;
  submitText?: string;
}

export default function CircleForm({ onSubmit, submitText }: CircleFormProps) {
  const form = useForm<CircleFormData>({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.trim() === "" ? "Name is required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" description="How will people refer to this circle?" placeholder="Participants, Collaborators, etc" withAsterisk {...form.getInputProps("name")} />
        </Stack>

        <Button type="submit" loading={form.submitting}>
          {submitText || "Submit"}
        </Button>
      </Stack>
    </form>
  );
}
