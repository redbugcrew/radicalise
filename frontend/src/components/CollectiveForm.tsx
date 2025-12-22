import { useForm } from "@mantine/form";
import { Button, Fieldset, Select, Stack, Switch, Textarea, TextInput } from "@mantine/core";
import type { Collective, CrewWithLinks, Link } from "../api/Api";
import LinksInput, { linksValidator } from "./links/LinksInput/LinksInput";

interface CollectiveFormProps {
  collective: Collective;
  crews: CrewWithLinks[];

  onSubmit: (values: Collective) => void;
}

interface CollectiveFormValues {
  description?: string | null;
  eoi_description?: string | null;
  eoi_managing_crew_id: string | null;
  feature_eoi: boolean;
  id: number;
  links: Link[];
  name?: string | null;
  noun_name?: string | null;
  slug?: string | null;
}

function convertCollectiveToFormValues(input: Collective): CollectiveFormValues {
  const crew_id = input.eoi_managing_crew_id !== null && input.eoi_managing_crew_id !== undefined ? input.eoi_managing_crew_id.toString() : null;

  return {
    ...input,
    eoi_managing_crew_id: crew_id,
  };
}

function convertFormValuesToCollective(input: CollectiveFormValues): Collective {
  const crew_id = input.eoi_managing_crew_id !== null && input.eoi_managing_crew_id !== undefined ? parseInt(input.eoi_managing_crew_id.toString(), 10) : null;

  return {
    ...input,
    eoi_managing_crew_id: crew_id,
  } as any;
}

export default function CollectiveForm({ collective, crews, onSubmit }: CollectiveFormProps) {
  const form = useForm<CollectiveFormValues>({
    mode: "controlled",
    initialValues: { ...convertCollectiveToFormValues(collective) },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      noun_name: (value) => (value ? null : "Noun name is required"),
      slug: (value) => (!value || /^[a-z0-9\-]+$/.test(value) ? null : "Slug may only inlcude lowercase letters, numbers, and hyphens fragement"),
      links: linksValidator,
    },
  });

  let crewOptionsData = [{ value: "", label: "None" }].concat(crews.map((crew) => ({ value: crew.id.toString(), label: crew.name || "Unnamed Crew" })));

  const internalOnSubmit = (values: CollectiveFormValues) => {
    const collective = convertFormValuesToCollective(values);
    onSubmit(collective);
  };

  return (
    <form onSubmit={form.onSubmit(internalOnSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" key="name" {...form.getInputProps("name")} />
          <TextInput label="Noun name" key="noun_name" {...form.getInputProps("noun_name")} />
          <TextInput label="Slug" key="slug" {...form.getInputProps("slug")} />
          <Textarea label="Description" rows={5} placeholder="Crew Description" key="description" {...form.getInputProps("description")} />
          <LinksInput label="Links" placeholder="Add a link" key="links" {...form.getInputProps("links")} />
          <Fieldset legend="Expression of interest feature">
            <Stack gap="md">
              <Switch label="Enable" {...form.getInputProps("feature_eoi", { type: "checkbox" })} />
              {form.values.feature_eoi && (
                <Stack gap="md">
                  <Textarea label="EOI Description" rows={5} placeholder="Description for EOI" key="eoi_description" {...form.getInputProps("eoi_description")} />

                  <Select label="Managing Crew" data={crewOptionsData} key="eoi_managing_crew_id" {...form.getInputProps("eoi_managing_crew_id")} />
                </Stack>
              )}
            </Stack>
          </Fieldset>
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
