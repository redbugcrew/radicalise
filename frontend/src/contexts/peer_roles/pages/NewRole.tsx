import { Container, Title, Stack } from "@mantine/core";
import RoleForm from "../components/RoleForm";
import type { NewRole } from "../../../api/Api"; //Todo: check NewRole in Api.ts (see CalanderEvent for model)
import { handleAppEvents, useAppSelector } from "../../../store";
import { getApi } from "../../../api";
import { useNavigate } from "react-router-dom";

export default function NewRole() {
  const peerRoles = useAppSelector((state) => state.peerRoles);
  const navigate = useNavigate();

  const handleSubmit = async (data: NewRole): Promise<void> => {
    return getApi()
      .api.createNewRole(data) // Todo: check createNewROle to Api.ts (see createCalendarEvent for model)
      .then((response) => {
        handleAppEvents(response.data);
        navigate("/peer_roles");
      })
      .catch((error) => {
        console.error("Error creating role:", error);
      });
  }; //

  return (
    <Container>
      <Stack mb="md">
        <Title order={1}>New Role</Title>

        {peerRoles.length === 0 && (
          <p>No event roles available. Please create one first.</p>
        )}

        {peerRoles.length > 0 && (
          <RoleForm onSubmit={handleSubmit} peerRoles={peerRoles} />
        )}
      </Stack>
    </Container>
  );
}
