import { useForm } from "@mantine/form";
import { Button, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { isValidEmail } from "../../utilities/validators";
import type { Circle } from "../../api/Api";

export interface InvitePersonValues {
  name: string;
  email: string;
  circleId: number | null;
  message: string;
}

interface InvitePersonFormProps {
  person?: InvitePersonValues;
  circles: Circle[];

  onSubmit: (values: InvitePersonValues) => void;
}

const defaultValues: InvitePersonValues = {
  name: "",
  email: "",
  circleId: null,
  message: "",
};

export default function InvitePersonForm({ person, circles, onSubmit }: InvitePersonFormProps) {
  const form = useForm<InvitePersonValues>({
    mode: "controlled",
    initialValues: {
      ...defaultValues,
      ...person,
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      email: (value) => (isValidEmail(value) ? null : "Invalid email"),
      circleId: (value) => (value ? null : "Circle is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" withAsterisk placeholder="The name you know this person by" key="name" {...form.getInputProps("name")} />
          <TextInput label="Email" withAsterisk placeholder="Their email address" key="email" {...form.getInputProps("email")} />
          <Select
            label="Circle"
            withAsterisk
            placeholder="Select a circle to add this person to"
            key="circleId"
            data={circles.map((circle) => ({ value: circle.id.toString(), label: circle.name }))}
            {...form.getInputProps("circleId")}
          />
          <Textarea label="Message" placeholder="Write something to this person about why you're inviting them" key="message" rows={5} {...form.getInputProps("message")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
