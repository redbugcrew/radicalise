import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Circle } from "../../../api/Api";
import { DisplayActionResult, useOnSubmitWithResult, type ActionPromiseResult } from "../../../components/ActionResult";

interface CircleFormProps {
  onSubmit: (data: Circle) => Promise<ActionPromiseResult>;
  submitText?: string;
  value?: Circle;
  otherCircles?: Circle[];
}

interface CircleFormValues {
  id: number;
  project_id: number;
  name: string;
  slug: string;
  inside_circle_id: string; // Use string for form input, convert to number or null on submit
}

function convertFormValuesToCircle(values: CircleFormValues): Circle {
  return {
    ...values,
    inside_circle_id: values.inside_circle_id ? parseInt(values.inside_circle_id) : null,
  };
}

const defaultCircle: Circle = {
  id: -1,
  project_id: -1,
  name: "",
  slug: "",
  inside_circle_id: null,
};

export default function CircleForm({ onSubmit, submitText, value, otherCircles = [] }: CircleFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<Circle>(onSubmit);

  const form = useForm<CircleFormValues>({
    initialValues: {
      ...defaultCircle,
      ...value,
      inside_circle_id: value?.inside_circle_id?.toString() || "",
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

  const onSubmitConverted = (values: CircleFormValues) => onSubmitWithResult(convertFormValuesToCircle(values));

  return (
    <form onSubmit={form.onSubmit(onSubmitConverted, (errors) => console.log("Form submission errors:", errors))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" description="How will people refer to this circle?" placeholder="Participants, Collaborators, etc" withAsterisk {...form.getInputProps("name")} />

          <TextInput label="Slug" description="How will this circle be identified in URLs and APIs? " placeholder="participants, collaborators, etc" withAsterisk {...form.getInputProps("slug")} />

          <NativeSelect
            label="Is this circle inside another circle?"
            description="If set, people in this circle will also be part of the containing circle"
            data={[{ value: "", label: "None" }, ...otherCircles.map((circle) => ({ value: circle.id.toString(), label: circle.name }))]}
            {...form.getInputProps("inside_circle_id")}
          />
        </Stack>

        <DisplayActionResult result={actionResult} />

        <Button type="submit" loading={form.submitting}>
          {submitText || "Submit"}
        </Button>
      </Stack>
    </form>
  );
}
