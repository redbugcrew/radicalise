import { useForm } from "@mantine/form";
import { Button, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { isValidEmail } from "../../utilities/validators";
import type { Circle, InvitePersonRequest } from "../../api/Api";
import { DisplayActionResult, useOnSubmitWithResult, type ActionPromiseResult } from "../ActionResult";

interface InvitePersonFormValues {
  name: string;
  email: string;
  circle_id: string | null;
  message: string;
}

interface InvitePersonFormProps {
  circles: Circle[];

  onSubmit: (values: InvitePersonRequest) => Promise<ActionPromiseResult>;
}

const defaultValues: InvitePersonFormValues = {
  name: "",
  email: "",
  circle_id: null,
  message: "",
};

function convertToRequestValues(values: InvitePersonFormValues): InvitePersonRequest {
  return {
    ...values,
    circle_id: (values.circle_id ? parseInt(values.circle_id) : null)!,
  };
}

export default function InvitePersonForm({ circles, onSubmit }: InvitePersonFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<InvitePersonRequest>(onSubmit);

  const form = useForm<InvitePersonFormValues>({
    mode: "controlled",
    initialValues: {
      ...defaultValues,
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      email: (value) => (isValidEmail(value) ? null : "Invalid email"),
      circle_id: (value) => (value ? null : "Circle is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmitWithResult(convertToRequestValues(values)))}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" withAsterisk placeholder="The name you know this person by" key="name" {...form.getInputProps("name")} />
          <TextInput label="Email" withAsterisk placeholder="Their email address" key="email" {...form.getInputProps("email")} />
          <Select
            label="Circle"
            withAsterisk
            placeholder="Select a circle to add this person to"
            key="circle_id"
            data={circles.map((circle) => ({ value: circle.id.toString(), label: circle.name }))}
            {...form.getInputProps("circle_id")}
          />
          <Textarea label="Message" placeholder="Write something to this person about why you're inviting them" key="message" rows={5} {...form.getInputProps("message")} />
        </Stack>

        <DisplayActionResult result={actionResult} />

        <Button type="submit" loading={form.submitting}>
          Submit
        </Button>
      </Stack>
    </form>
  );
}
