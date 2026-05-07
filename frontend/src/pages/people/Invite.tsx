import { Stack, Title } from "@mantine/core";
import InvitePersonForm, { type InvitePersonValues } from "../../components/people/InvitePersonForm";
import { useAppSelector } from "../../store";

export default function InvitePerson() {
  const circles = useAppSelector((state) => state.circles.rootCircles);

  const onSubmit = (values: InvitePersonValues) => {
    console.log(values);
  };

  return (
    <Stack>
      <Title>Invite person</Title>
      <InvitePersonForm onSubmit={onSubmit} circles={circles} />
    </Stack>
  );
}
