import { Stack, Title } from "@mantine/core";
import InvitePersonForm from "../../components/people/InvitePersonForm";
import { useAppSelector } from "../../store";
import type { InvitePersonRequest } from "../../api/Api";
import { getApi } from "../../api";
import { actionFailure } from "../../components/ActionResult";

export default function InvitePerson() {
  const circles = useAppSelector((state) => state.circles.rootCircles);

  const onSubmit = (values: InvitePersonRequest) => {
    return getApi()
      .api.invitePerson(values)
      .then(() => {
        // Handle success, e.g., show a notification or redirect
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
