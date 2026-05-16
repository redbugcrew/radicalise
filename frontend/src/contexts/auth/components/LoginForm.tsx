import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { isValidEmail } from "../../../utilities/validators";
import { DisplayActionResult, useOnSubmitWithResult, type ActionPromiseResult } from "../../../components/ActionResult";

export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormData) => Promise<ActionPromiseResult>;
  submitText?: string;
}

export default function LoginForm({ onSubmit, submitText = "Sign in" }: LoginFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<LoginFormData>(onSubmit);

  const form = useForm<LoginFormData>({
    mode: "controlled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (isValidEmail(value) ? null : "Invalid email"),
      password: (value) => (value.length >= 6 ? null : "Password must be at least 6 characters long"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmitWithResult)}>
      <Stack gap="xl">
        <Stack gap="md">
          <TextInput label="Email" placeholder="Your email" required radius="md" {...form.getInputProps("email")} />
          <PasswordInput label="Password" placeholder="Your password" required radius="md" {...form.getInputProps("password")} />
        </Stack>

        <DisplayActionResult result={actionResult} />

        <Button fullWidth radius="md" type="submit" loading={form.submitting}>
          {submitText}
        </Button>
      </Stack>
    </form>
  );
}
