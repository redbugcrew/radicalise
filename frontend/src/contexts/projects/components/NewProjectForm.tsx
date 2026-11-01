import { useForm } from "@mantine/form"
import { Button, Stack, TextInput } from "@mantine/core"
import { DisplayActionResult, DisplayFormError, useOnSubmitWithResult, type ActionPromiseResult } from "../../../components/ActionResult"
import type { NewProjectData } from "../../../api/Api"

interface NewProjectFormProps {
  onSubmit: (values: NewProjectData) => Promise<ActionPromiseResult>
}

export default function NewProjectForm({ onSubmit }: NewProjectFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<NewProjectData>(onSubmit)

  const form = useForm<NewProjectData>({
    mode: "controlled",
    validate: {
      name: (value) => (value ? null : "Name is required"),
      slug: (value) => {
        if (!value) return "URL name is required"
        if (!/^[a-z0-9-]+$/.test(value)) return "URL name may only include lowercase letters, numbers, and hyphens"
        return null
      },
      person_name: (value) => (value ? null : "Your Name is required"),
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmitWithResult)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput
            label="Project Name"
            key="name"
            {...form.getInputProps("name")}
            placeholder="eg: The Awesome Club"
            description="A display name for your project, try and make it a noun."
            required
          />

          <TextInput
            label="URL Name"
            key="slug"
            {...form.getInputProps("slug")}
            placeholder="eg: awesome-club"
            error={form.errors.slug || (actionResult?.error === "SlugAlreadyTaken" ? "That project URL name is already taken" : undefined)}
            description="Lowercase letters and hyphens, to use in your project URL"
            required
          />

          <TextInput
            label="Your Name"
            key="person_name"
            {...form.getInputProps("person_name")}
            placeholder="eg: Demosthenes"
            description="You can have a different display name in each project"
            required
          />
        </Stack>

        <DisplayActionResult
          result={actionResult}
          handlers={{ SlugAlreadyTaken: <DisplayFormError heading={"That project URL name is already taken"} /> }}
        />

        <Button type="submit">Create project</Button>
      </Stack>
    </form>
  )
}
