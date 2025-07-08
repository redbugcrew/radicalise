import { useForm } from "@mantine/form";
import type { Crew } from "../../api/Api";
import { Button, Stack, TextInput } from "@mantine/core";
import LinksInput, { type LinksWithType } from "../forms/LinksInput/LinksInput";

interface CrewFormProps {
  crew: Crew;

  onSubmit: (values: Crew) => void;
}

type CrewFormData = Crew & {
  links: LinksWithType;
};

const linkValues: LinksWithType = [
  { link_type: "Loomio", url: "https://example.com" },
  { link_type: "Matrix", url: "https://github.com/example" },
];

export default function CrewForm({ crew, onSubmit }: CrewFormProps) {
  const form = useForm<CrewFormData>({
    mode: "controlled",
    initialValues: { ...crew, links: linkValues },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      description: (value) => (value ? null : "Description is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <p>{JSON.stringify(form)}</p>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="Crew Name" key="name" {...form.getInputProps("name")} />
          <TextInput label="Description" placeholder="Crew Description" key="description" {...form.getInputProps("description")} />
          <LinksInput label="Links" placeholder="Add a link" key="links" {...form.getInputProps("links")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
