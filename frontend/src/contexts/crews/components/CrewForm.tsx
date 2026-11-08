import { useForm } from "@mantine/form"
import { Button, Stack, TextInput } from "@mantine/core"
import LinksInput, { optionalLinksValidator } from "../../../components/links/LinksInput/LinksInput"
import type { CrewWithLinks } from "../../../store/crews"

interface CrewFormProps {
  crew?: CrewWithLinks
  projectId: number

  onSubmit: (values: CrewWithLinks) => void
}

function defaultValue(projectId: number): CrewWithLinks {
  return {
    id: -1,
    project_id: projectId,
    name: "",
    description: "",
    links: [],
  }
}

export default function CrewForm({ crew, projectId, onSubmit }: CrewFormProps) {
  const form = useForm<CrewWithLinks>({
    mode: "controlled",
    initialValues: { ...(crew ?? defaultValue(projectId)) },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      description: (value) => (value ? null : "Description is required"),
      links: optionalLinksValidator as (value: unknown) => string | null,
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="Crew Name" key="name" {...form.getInputProps("name")} />
          <TextInput label="Description" placeholder="Crew Description" key="description" {...form.getInputProps("description")} />
          <LinksInput label="Links" placeholder="Add a link" key="links" {...form.getInputProps("links")} />
        </Stack>
        <Button type="submit">Update</Button>
      </Stack>
    </form>
  )
}
