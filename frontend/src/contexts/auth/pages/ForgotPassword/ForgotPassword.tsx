import { IconArrowLeft } from "@tabler/icons-react";
import { Alert, Box, Button, Center, Group, Paper, Text, TextInput } from "@mantine/core";
import classes from "./ForgotPassword.module.css";
import { useForm } from "@mantine/form";
import { getApi } from "../../../../api";
import { Anchor } from "../../../../components";
import { useState } from "react";
import { isValidEmail } from "../../../../utilities/validators";
import AuthLayout from "../../components/AuthLayout";

type ForgotPasswordResult = "sent" | "error";

export default function ForgotPassword() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) => (isValidEmail(value) ? null : "Invalid email"),
    },
  });

  let [result, setResult] = useState<ForgotPasswordResult | null>(null);

  const api = getApi();

  const onSubmit = ({ email }: { email: string }) => {
    api.api
      .forgotPassword({ email })
      .then(() => {
        setResult("sent");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // If the email is not found, we still want to show a success message
          setResult("sent");
        } else {
          // For other errors, we show an error message
          console.error("Error sending reset password email:", error);
          setResult("error");
        }
      });
  };

  if (result === "sent") {
    return (
      <AuthLayout title="Check your email">
        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
          <Text fz="sm" ta="center" mb="md">
            We sent you an email with a link to reset your password.
          </Text>
          <Anchor href="/auth/login" c="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Back to the login page</Box>
            </Center>
          </Anchor>
        </Paper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" description="Enter your email to get a reset link">
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <TextInput label="Your email" placeholder="me@mydomain.net" required {...form.getInputProps("email")} />
        <Group justify="space-between" mt="lg" className={classes.controls}>
          <Anchor href="../login" c="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Back to the login page</Box>
            </Center>
          </Anchor>
          <Button className={classes.control} type="submit">
            Reset password
          </Button>
        </Group>
        {result === "error" && (
          <Alert color="red" mt="md" title="Error">
            An error occurred while sending the reset link. Please try again.
          </Alert>
        )}
      </form>
    </AuthLayout>
  );
}
