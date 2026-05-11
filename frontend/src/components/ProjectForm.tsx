import { useForm } from "@mantine/form";
import { Button, Fieldset, Select, Stack, Switch, Textarea, TextInput } from "@mantine/core";
import type { Project, CrewWithLinks, Link } from "../api/Api";
import LinksInput, { linksValidator } from "./links/LinksInput/LinksInput";

interface ProjectFormProps {
  project: Project;
  crews: CrewWithLinks[];

  onSubmit: (values: Project) => void;
}

interface ProjectFormValues {
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

function convertProjectToFormValues(input: Project): ProjectFormValues {
  const crew_id = input.eoi_managing_crew_id !== null && input.eoi_managing_crew_id !== undefined ? input.eoi_managing_crew_id.toString() : null;

  return {
    ...input,
    eoi_managing_crew_id: crew_id,
  };
}

function convertFormValuesToProject(input: ProjectFormValues): Project {
  const crew_id = input.eoi_managing_crew_id !== null && input.eoi_managing_crew_id !== undefined ? parseInt(input.eoi_managing_crew_id.toString(), 10) : null;

  return {
    ...input,
    eoi_managing_crew_id: crew_id,
  } as any;
}

export default function ProjectForm({ project, crews, onSubmit }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    mode: "controlled",
    initialValues: { ...convertProjectToFormValues(project) },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      noun_name: (value) => (value ? null : "Noun name is required"),
      slug: (value) => (!value || /^[a-z0-9\-]+$/.test(value) ? null : "Slug may only include lowercase letters, numbers, and hyphens"),
      links: linksValidator,
    },
  });

  let crewOptionsData = [{ value: "", label: "None" }].concat(crews.map((crew) => ({ value: crew.id.toString(), label: crew.name || "Unnamed Crew" })));

  const internalOnSubmit = (values: ProjectFormValues) => {
    const project = convertFormValuesToProject(values);
    onSubmit(project);
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
