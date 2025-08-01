import { Container } from "@mantine/core";
import { useParams } from "react-router-dom";

export default function ManageMyEoi() {
  const { authToken } = useParams<"authToken">();

  return (
    <Container>
      <h1>Manage My Expression of Interest</h1>
      <p>Auth token is {authToken}.</p>
    </Container>
  );
}
