import { IconArrowLeft } from "@tabler/icons-react";
import { Box, Button, Center, Container, Group, Paper, Text, TextInput, Title } from "@mantine/core";
import classes from "./ForgotPassword.module.css";
import { getApi } from "../../api";
import { Anchor } from "../../components";

export default function ForgotPassword() {
  const api = getApi();

  const onSubmit = () => {
    console.log("Sending to API");
    api.api.forgotPassword();
  };
  ``;
  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput label="Your email" placeholder="me@mantine.dev" required />
        <Group justify="space-between" mt="lg" className={classes.controls}>
          <Anchor href="/login" c="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Back to the login page</Box>
            </Center>
          </Anchor>
          <Button className={classes.control} onClick={onSubmit}>
            Reset password
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
