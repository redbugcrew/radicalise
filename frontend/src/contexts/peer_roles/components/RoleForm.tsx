import { useForm } from "@mantine/form";
import { Button, Stack, TextInput } from "@mantine/core";

export interface RoleFormData {
  id: number;
  name: string | null;
  summary: string;
}

interface PeerRolesFormProps {
  value?: RoleFormData | null; //Todo: add NewRole to Api.ts (see CalanderEvent for model)
  submitText?: string;
  onSubmit: (data: RoleFormData) => Promise<void>;
}

const defaultRole: RoleFormData = {
  id: -1,
  name: "",
  summary: "",
};

export default function NewRoleForm({
  value,
  submitText,
  onSubmit,
}: PeerRolesFormProps) {
  const form = useForm<RoleFormData>({
    mode: "controlled",
    initialValues: {
      ...defaultRole,
      ...value,
    },
    validate: {
      name: (value) =>
        value && value.trim().length > 0 ? null : "Name is required",
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(onSubmit, (errors) =>
        console.log("Form submission errors:", errors),
      )}
    >
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput
            label="Name"
            description="The name of this role."
            placeholder="Care Supporter, Participation Buddy, etc"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Summary"
            description="A short summary of the role to provide more context."
            placeholder="A brief summary of the responsibilities associated with the role"
            {...form.getInputProps("summary")}
          />
        </Stack>
        <Button type="submit" loading={form.submitting}>
          {submitText || "Create role"}
        </Button>
      </Stack>
    </form>
  );
}
