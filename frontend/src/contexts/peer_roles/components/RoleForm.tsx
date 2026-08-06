import { useForm } from "@mantine/form";
import { Button, Select, Stack, Textarea, TextInput } from "@mantine/core";

interface RoleFormData {
  id: number;
  role_table_id: number | null;
  name: string | null;
  summary: string;
  action: string;
}

interface PeerRolesFormProps {
  value?: NewRole | null; //Todo: add NewRole to Api.ts (see CalanderEvent for model)
  peerRoles?: PeerRolesTable[]; //Todo: add PeerRolesTable to Api.ts (see example EventsTemplate)
  submitText?: string;
  onSubmit: (data: NewRole) => Promise<void>;
}

// Todo: add NewRole and PeerRolesTable to Api.ts 

const defaultRole: RoleFormData = {
  id: -1,
  role_table_id: null,
  name: "",
  summary: "",
  action: "",
};

function prepareNewRole(data: RoleFormData): NewRole | null {
  if (!data.role_table_id || !data.name) {
    return null;
  }

  return {
    ...data,
    role_table_id: parseInt(data.role_table_id.toString(), 10),
    name: data.name,
  };
}

export default function NewRoleForm({ value, peerRoles, submitText, onSubmit }: PeerRolesFormProps) {
  const form = useForm<RoleFormData>({
    mode: "controlled",
    initialValues: {
      ...defaultRole,
      ...value,
    },
    validate: {
      role_table_id: (value) => (value ? null : "Peer role ID is required"),
      name: (value) => (value && value.trim().length > 0 ? null : "Name is required"),
        }
        return null;
      },
  });  // Todo: investigate useForm error

  const onSubmitFormData = (data: RoleFormData) => {
    const preparedRole = prepareNewRole(data);
    if (preparedRole) {
      onSubmit(preparedRole);
    } else {
      console.error("Failed to prepare new role from form data:", data);
    }
  };  // Todo: investigate OnSubmit error
  
    return (
      <form onSubmit={form.onSubmit(onSubmitFormData, (errors) => console.log("Form submission errors:", errors))}>
        <Stack gap="lg">
          <Stack gap="md">
            {peerRoles && peerRoles.length >= 0 && (
              <Select
                label="Event Template"
                description=""
                placeholder="Pick value"
                data={peerRoles.map((template) => ({ label: template.name, value: template.id.toString() }))}
                key={form.key("peer_roles_table_id")}
                {...form.getInputProps("peer_roles_table_id")}
              />
            )} // Todo: investigate peerRoles and form errors
  
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
            {submitText || "Create event"}
          </Button>
        </Stack>
      </form>
    );
  }

