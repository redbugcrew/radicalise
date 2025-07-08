import { useForm } from "@mantine/form";
import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import type { Collective } from "../api/Api";

interface CollectiveFormProps {
  collective: Collective;

  onSubmit: (values: Collective) => void;
}

export default function CollectiveForm({ collective, onSubmit }: CollectiveFormProps) {
  const form = useForm<Collective>({
    mode: "controlled",
    initialValues: { ...collective },
    validate: {
      name: (value) => (value ? null : "Name is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="Crew Name" key="name" {...form.getInputProps("name")} />
          <Textarea label="Description" rows={5} placeholder="Crew Description" key="description" {...form.getInputProps("description")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
