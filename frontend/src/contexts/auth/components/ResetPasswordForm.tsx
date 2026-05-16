import { Button, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DisplayActionResult, useOnSubmitWithResult, type ActionPromiseResult } from "../../../components/ActionResult";

export interface ResetPasswordFormData {
  password: string;
}

export interface ResetPasswordProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<ActionPromiseResult>;
}

export default function ResetPassword({ onSubmit }: ResetPasswordProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<ResetPasswordFormData>(onSubmit);

  const form = useForm<ResetPasswordFormData>({
    mode: "controlled",
    initialValues: {
      password: "",
    },

    validate: {
      password: (value) => (value.length >= 6 ? null : "Password must be at least 6 characters long"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmitWithResult)}>
      <Stack gap="lg">
        <PasswordInput label="New password" placeholder="Your new password" required radius="md" key={form.key("password")} {...form.getInputProps("password")} />

        <DisplayActionResult result={actionResult} />

        <Button type="submit" fullWidth radius="md" loading={form.submitting}>
          Submit
        </Button>
      </Stack>
    </form>
  );
}
