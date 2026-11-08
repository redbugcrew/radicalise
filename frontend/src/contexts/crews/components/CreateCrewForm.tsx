import { useForm } from "@mantine/form"
import { Button, Select, Stack, TextInput } from "@mantine/core"
import LinksInput, { optionalLinksValidator } from "../../../components/links/LinksInput/LinksInput"
import type { CreateCrewData, Interval, Link } from "../../../api/Api"

interface CrewFormProps {
  projectId: number
  intervals: Interval[]
  onSubmit: (values: CreateCrewData) => void
}

interface CreateCrewFormData {
  name: string
  description?: string | null
  links?: Link[] | null
  start_interval_number?: string
}

function defaultValue(): CreateCrewFormData {
  return {
    start_interval_number: "",
    name: "",
    description: "",
    links: [],
  }
}

export default function CreateCrewForm({ projectId, intervals, onSubmit }: CrewFormProps) {
  const form = useForm<CreateCrewFormData>({
    mode: "controlled",
    initialValues: defaultValue(),
    validate: {
      name: (value) => (value ? null : "Name is required"),
      description: (value) => (value ? null : "Description is required"),
      start_interval_number: (value) => (value ? null : "Start interval is required"),
      links: optionalLinksValidator as (value: unknown) => string | null,
    },
  })

  const onSubmitForm = (values: CreateCrewFormData) => {
    const startIntervalNumber = values.start_interval_number ? parseInt(values.start_interval_number) : null
    if (startIntervalNumber === null) return

    onSubmit({
      ...values,
      start_interval_number: startIntervalNumber,
      project_id: projectId,
    })
  }

  return (
    <form onSubmit={form.onSubmit(onSubmitForm)}>
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="Crew Name" key="name" required {...form.getInputProps("name")} />
          <TextInput label="Description" placeholder="Crew Description" key="description" required {...form.getInputProps("description")} />

          <Select
            label="Start Interval"
            placeholder="Select a start interval"
            key="start_interval_number"
            required
            data={intervals.map((interval) => ({ value: interval.number.toString(), label: `Interval ${interval.number}` }))}
            {...form.getInputProps("start_interval_number")}
          />

          <LinksInput label="Links" placeholder="Add a link" key="links" {...form.getInputProps("links")} />
        </Stack>
        <Button type="submit">Create</Button>
      </Stack>
    </form>
  )
}
