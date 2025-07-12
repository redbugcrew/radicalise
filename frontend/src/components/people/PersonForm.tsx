import { useForm } from "@mantine/form";
import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import type { Person } from "../../api/Api";
import { AvatarSelect } from "./AvatarSelect";

interface PersonFormProps {
  person: Person;

  onSubmit: (values: Person) => void;
}

export default function PersonForm({ person, onSubmit }: PersonFormProps) {
  const form = useForm<Person>({
    mode: "controlled",
    initialValues: {
      ...person,
      avatar_id: person.avatar_id ?? person.id,
    },
    validate: {
      display_name: (value) => (value ? null : "Display name is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Display name" placeholder="Your name in this app" key="display_name" {...form.getInputProps("display_name")} />
          <AvatarSelect label="Avatar" key="avatar" {...form.getInputProps("avatar_id")} />
          <Textarea label="About me" rows={5} placeholder="Anything you'd like to share about yourself with the collective" key="about" {...form.getInputProps("about")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
