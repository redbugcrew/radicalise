import { Stack, Title } from "@mantine/core";
import InvitePersonForm from "../../components/people/InvitePersonForm";
import { handleAppEvents, useAppSelector } from "../../store";
import type { InvitePersonRequest } from "../../api/Api";
import { getApi } from "../../api";
import { actionFailure } from "../../components/ActionResult";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

export default function InvitePerson() {
  const circles = useAppSelector((state) => state.circles.rootCircles);
  const navigate = useNavigate();

  const onSubmit = (values: InvitePersonRequest) => {
    return getApi()
      .api.invitePerson(values)
      .then((response) => {
        const { events, person } = response.data;
        handleAppEvents(events);
        notifications.show({
          title: "Invitation sent",
          message: `${person.display_name} has been invited successfully.`,
          color: "green",
        });
        navigate("/people");
      })
      .catch((error) => {
        return actionFailure(error);
      });
  };

  return (
    <Stack>
      <Title>Invite person</Title>
      <InvitePersonForm onSubmit={onSubmit} circles={circles} />
    </Stack>
  );
}
