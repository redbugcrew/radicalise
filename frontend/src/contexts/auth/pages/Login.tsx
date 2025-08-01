import { Button, Container, Group, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import classes from "../Auth.module.css";
import { Anchor } from "../../../components";
import { useForm } from "@mantine/form";
import { getApi } from "../../../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/\S+@\S+\.\S+/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length >= 6 ? null : "Password must be at least 6 characters long"),
    },
  });

  const onSubmit = ({ email, password }: { email: string; password: string }) => {
    const api = getApi();
    api.api
      .login({ email, password })
      .then(({ data }) => {
        // Handle successful login
        console.log("Login successful", data);
        navigate("/");
      })
      .catch((error) => {
        // Handle login error
        console.error("Login failed", error);
        form.setFieldError("password", "Invalid email or password");
      });
  };

  return (
    <Container size={420} my={40}>
      <form onSubmit={form.onSubmit(onSubmit)}>
        {/* The form submission handler should be replaced with actual login logic */}
        <Title ta="center" className={classes.title}>
          Welcome back!
        </Title>

        <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
          <TextInput label="Email" placeholder="Your email" required radius="md" {...form.getInputProps("email")} />
          <PasswordInput label="Password" placeholder="Your password" required mt="md" radius="md" {...form.getInputProps("password")} />
          <Group justify="space-between" mt="lg">
            <Anchor href="../forgot_password" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" radius="md" type="submit">
            Sign in
          </Button>
        </Paper>
      </form>
    </Container>
  );
}
