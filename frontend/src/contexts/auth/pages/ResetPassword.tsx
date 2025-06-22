import { Button, Container, Paper, PasswordInput, Title } from "@mantine/core";
import classes from "../Auth.module.css";
import { useForm } from "@mantine/form";

export default function ResetPassword() {
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
    console.log("Resetting password to:", password);
  };

  return (
    <Container size={420} my={40}>
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <Title ta="center" className={classes.title}>
          Reset your password
        </Title>

        {form.errors.password}

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
