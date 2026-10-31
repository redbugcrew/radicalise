import { useForm } from "@mantine/form"
import { Button, Stack, Textarea, TextInput } from "@mantine/core"
import type { Project, Link } from "../../../api/Api"
import LinksInput, { linksValidator } from "../../../components/links/LinksInput/LinksInput"

interface ProjectFormProps {
  project?: Project | null

  onSubmit: (values: Project) => void
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

export default function ProjectForm({ project, onSubmit }: ProjectFormProps) {
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

  const internalOnSubmit = (values: ProjectFormValues) => {
    const project = convertFormValuesToProject(values)
    onSubmit(project)
  }

  return (
    <form onSubmit={form.onSubmit(internalOnSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" key="name" {...form.getInputProps("name")} />
          <TextInput label="Noun name" key="noun_name" {...form.getInputProps("noun_name")} />
          <TextInput label="Slug" key="slug" {...form.getInputProps("slug")} />
          <Textarea label="Description" rows={5} placeholder="Crew Description" key="description" {...form.getInputProps("description")} />
          <LinksInput label="Links" placeholder="Add a link" key="links" {...form.getInputProps("links")} />
        </Stack>
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  )
}
