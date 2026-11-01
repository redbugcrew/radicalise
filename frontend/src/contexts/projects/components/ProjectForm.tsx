import { useForm } from "@mantine/form"
import { Button, Stack, Textarea, TextInput } from "@mantine/core"
import type { Project, Link } from "../../../api/Api"
import LinksInput, { linksValidator } from "../../../components/links/LinksInput/LinksInput"
import { DisplayActionResult, DisplayFormError, useOnSubmitWithResult, type ActionPromiseResult } from "../../../components/ActionResult"

interface ProjectFormProps {
  project?: Project | null
  noLinks?: boolean

  onSubmit: (values: Project) => Promise<ActionPromiseResult>
}

interface ProjectFormValues {
  description?: string | null
  id: number
  links: Link[]
  name?: string | null
  noun_name?: string | null
  slug?: string | null
}

function convertProjectToFormValues(input?: Project | null | undefined): ProjectFormValues {
  if (!input) {
    return {
      id: 0,
      links: [],
    }
  } else {
    return {
      ...input,
    }
  }
}

function convertFormValuesToProject(input: ProjectFormValues): Project {
  return {
    ...input,
  } as any
}

export default function ProjectForm({ project, onSubmit, noLinks }: ProjectFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<Project>(onSubmit)

  const form = useForm<ProjectFormValues>({
    mode: "controlled",
    initialValues: { ...convertProjectToFormValues(project) },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      noun_name: (value) => (value ? null : "Noun name is required"),
      slug: (value) => (!value || /^[a-z0-9-]+$/.test(value) ? null : "Slug may only include lowercase letters, numbers, and hyphens"),
      links: linksValidator,
    },
  })

  const onSubmitConverted = (values: ProjectFormValues) => onSubmitWithResult(convertFormValuesToProject(values))

  return (
    <form onSubmit={form.onSubmit(onSubmitConverted)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" key="name" {...form.getInputProps("name")} placeholder="eg: Awesome Club" />
          <TextInput label="Noun name" key="noun_name" {...form.getInputProps("noun_name")} placeholder="eg: The Awesome Club" />

          <TextInput
            label="URL name"
            key="slug"
            {...form.getInputProps("slug")}
            placeholder="eg: awesome-club"
            error={form.errors.slug || (actionResult?.error === "SlugAlreadyTaken" ? "That project URL name is already taken" : undefined)}
          />

          <Textarea
            label="Description"
            rows={5}
            placeholder="Your project description"
            key="description"
            {...form.getInputProps("description")}
          />
          {!noLinks && <LinksInput label="Links" placeholder="Add a link" key="links" {...form.getInputProps("links")} />}
        </Stack>

        <DisplayActionResult
          result={actionResult}
          handlers={{ SlugAlreadyTaken: <DisplayFormError heading={"That project URL name is already taken"} /> }}
        />

        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  )
}
