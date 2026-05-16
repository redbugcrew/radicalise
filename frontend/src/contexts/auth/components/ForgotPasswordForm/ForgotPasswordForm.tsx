import { IconArrowLeft } from "@tabler/icons-react";
import { Box, Button, Center, Group, Stack, TextInput } from "@mantine/core";
import classes from "./ForgotPasswordForm.module.css";
import { useForm } from "@mantine/form";
import { Anchor } from "../../../../components";
import { isValidEmail } from "../../../../utilities/validators";
import { DisplayActionResult, useOnSubmitWithResult, type ActionPromiseResult } from "../../../../components/ActionResult";

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<ActionPromiseResult>;
  backLink?: string;
}

export default function ForgotPasswordForm({ onSubmit, backLink }: ForgotPasswordFormProps) {
  const [actionResult, onSubmitWithResult] = useOnSubmitWithResult<ForgotPasswordFormData>(onSubmit);

  const form = useForm<ForgotPasswordFormData>({
    mode: "controlled",
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) => (isValidEmail(value) ? null : "Invalid email"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmitWithResult)}>
      <Stack gap="xl">
        <TextInput label="Your email" placeholder="me@mydomain.net" required {...form.getInputProps("email")} />

        <DisplayActionResult result={actionResult} />

        <Group justify="space-between" mt="lg" className={classes.controls}>
          {backLink && (
            <Anchor href={backLink} c="dimmed" size="sm" className={classes.control}>
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Anchor>
          )}

          <Button className={classes.control} type="submit">
            Reset password
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
