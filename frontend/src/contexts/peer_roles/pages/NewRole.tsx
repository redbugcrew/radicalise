import { Container, Title, Stack } from "@mantine/core";
import RoleForm, { type RoleFormData } from "../components/RoleForm";

export default function NewRole() {
  //const navigate = useNavigate();

  const handleSubmit = async (data: RoleFormData): Promise<void> => {
    console.log("handling form result", data);
    //return getApi()
    //  .api.createNewRole(data)
    //  .then((response) => {
    //    handleAppEvents(response.data);
    //    navigate("/peer_roles");
    //  })
    //  .catch((error) => {
    //    console.error("Error creating role:", error);
    //  });
  }; // These lines can replace the console.log line once the createNewRol api endpoint has been set up

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Role</Title>
        <RoleForm onSubmit={handleSubmit} />
      </Stack>
    </Container>
  );
}
