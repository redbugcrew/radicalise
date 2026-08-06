import PeerRolesTable from "../components/PeerRolesTable";
import RoleForm from "../components/RoleForm";

export default function NewRole() {
  const peerRoles = PeerRolesTable;

  //  const navigate = useNavigate();

  //  const handleSubmit = async (data: CalendarEvent): Promise<void> => {
  //    return getApi()
  //      .api.createCalendarEvent(data)
  //      .then((response) => {
  //        handleAppEvents(response.data);
  //        navigate("/events");
  //      })
  //      .catch((error) => {
  //        console.error("Error creating event:", error);
  //      });
  //  };

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
