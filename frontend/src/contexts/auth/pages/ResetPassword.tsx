import { Button, Container, Paper, PasswordInput, Title } from "@mantine/core";
import classes from "../Auth.module.css";
import { useForm } from "@mantine/form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApi } from "../../../api";

export default function ResetPassword() {
  const [searchParams, _setSearchParams] = useSearchParams();
  let navigate = useNavigate();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <Container size={420} my={40}>
        Error: Token is missing
      </Container>
    );
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
    },

    validate: {
      password: (value) => (value.length >= 6 ? null : "Password must be at least 6 characters long"),
    },
  });

  const onSubmit = ({ password }: { password: string }) => {
    const api = getApi();
    api.api
      .resetPassword({ token, password })
      .then(() => {
        navigate("../login", { replace: true });
      })
      .catch((error: any) => {
        console.error("Error resetting password:", error);
        form.setErrors({ password: "Failed to reset password. Please try again." });
      });
  };

  return (
    <Container size={420} my={40}>
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <Title ta="center" className={classes.title}>
          Reset your password
        </Title>

        <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
          <PasswordInput label="New password" placeholder="Your new password" required radius="md" key={form.key("password")} {...form.getInputProps("password")} />
          <Button type="submit" fullWidth mt="xl" radius="md">
            Submit
          </Button>
        </Paper>
      </form>
    </Container>
  );
}
