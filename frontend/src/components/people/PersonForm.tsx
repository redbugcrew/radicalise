import { useForm } from "@mantine/form";
import { Button, Stack, TextInput } from "@mantine/core";
import type { Person } from "../../api/Api";

interface PersonFormProps {
  person: Person;

  onSubmit: (values: Person) => void;
}

export default function PersonForm({ person, onSubmit }: PersonFormProps) {
  const form = useForm<Person>({
    mode: "controlled",
    initialValues: { ...person },
    validate: {
      display_name: (value) => (value ? null : "Display name is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Display Name" placeholder="Your name in this app" key="display_name" {...form.getInputProps("display_name")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
