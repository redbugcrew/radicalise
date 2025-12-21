import { Button, Container, List, Stack, Title } from "@mantine/core";
import { getApi } from "../api";

export default function Dev() {
  const api = getApi().api;

  const onRecomputeImplicitInvolvements = () => {
    api
      .recomputeImplicitInvolvements()
      .then(() => {
        alert("Recomputation success");
      })
      .catch((error) => {
        alert("Error performing recomputation: " + error.message);
      });
  };

  return (
    <Container>
      <Stack>
        <Title>Dev Page</Title>
        <List>
          <List.Item>
            <Button color="orange" onClick={onRecomputeImplicitInvolvements}>
              Recompute implicit involvements
            </Button>
          </List.Item>
        </List>
      </Stack>
    </Container>
  );
}
