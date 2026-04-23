import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

interface CircleFormData {
  name: string;
  slug: string;
}

interface CircleFormProps {
  onSubmit: (data: CircleFormData) => Promise<void>;
  submitText?: string;
}

export default function CircleForm({ onSubmit, submitText }: CircleFormProps) {
  const form = useForm<CircleFormData>({
    initialValues: {
      name: "",
      slug: "",
    },
    validate: {
      name: (value) => (value.trim() === "" ? "Name is required" : null),
      slug: (value) => {
        if (value.trim() === "") return "Slug is required";
        if (!/^[a-z0-9\-]+$/.test(value)) return "Slug may only include lowercase letters, numbers, and hyphens";

        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" description="How will people refer to this circle?" placeholder="Participants, Collaborators, etc" withAsterisk {...form.getInputProps("name")} />

          <TextInput label="Slug" description="How will this circle be identified in URLs and APIs? " placeholder="participants, collaborators, etc" withAsterisk {...form.getInputProps("slug")} />
        </Stack>

        <Button type="submit" loading={form.submitting}>
          {submitText || "Submit"}
        </Button>
      </Stack>
    </form>
  );
}
