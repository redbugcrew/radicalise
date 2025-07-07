import { useForm } from "@mantine/form";
import type { Crew } from "../../api/Api";
import { Button, Stack, TextInput } from "@mantine/core";

interface CrewFormProps {
  crew: Crew;
  onSubmit: (values: Crew) => void;
}

export default function CrewForm({ crew, onSubmit }: CrewFormProps) {
  const form = useForm<Crew>({
    mode: "controlled",
    initialValues: crew,
    validate: {
      name: (value) => (value ? null : "Name is required"),
      description: (value) => (value ? null : "Description is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="Crew Name" {...form.getInputProps("name")} />
          <TextInput label="Description" placeholder="Crew Description" {...form.getInputProps("description")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
