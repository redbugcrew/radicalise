import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Circle } from "../../../api/Api";
import { DisplayActionResult, useOnSubmitWithResult, type ActionPromiseResult } from "../../../components/ActionResult";

interface CircleFormProps {
  onSubmit: (data: Circle) => Promise<ActionPromiseResult>;
  submitText?: string;
  value?: Circle;
}

const defaultCircle: Circle = {
  id: -1,
  project_id: -1,
  name: "",
  slug: "",
};

export default function CircleForm({ onSubmit, submitText, value }: CircleFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<Circle>(onSubmit);

  const form = useForm<Circle>({
    initialValues: {
      ...defaultCircle,
      ...value,
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
    <form onSubmit={form.onSubmit(onSubmitWithResult, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" description="How will people refer to this circle?" placeholder="Participants, Collaborators, etc" withAsterisk {...form.getInputProps("name")} />

          <TextInput label="Slug" description="How will this circle be identified in URLs and APIs? " placeholder="participants, collaborators, etc" withAsterisk {...form.getInputProps("slug")} />
        </Stack>

        <DisplayActionResult result={actionResult} />

        <Button type="submit" loading={form.submitting}>
          {submitText || "Submit"}
        </Button>
      </Stack>
    </form>
  );
}
