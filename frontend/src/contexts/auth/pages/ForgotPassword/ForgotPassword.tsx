import { IconArrowLeft } from "@tabler/icons-react";
import { Box, Center, Paper, Text } from "@mantine/core";
import classes from "./ForgotPassword.module.css";
import { getApi } from "../../../../api";
import { Anchor } from "../../../../components";
import { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import ForgotPasswordForm, { type ForgotPasswordFormData } from "../../components/ForgotPasswordForm/ForgotPasswordForm";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../../components/ActionResult";

type ForgotPasswordResult = "sent" | "error";

export default function ForgotPassword() {
  let [result, setResult] = useState<ForgotPasswordResult | null>(null);

  const onSubmit = ({ email }: ForgotPasswordFormData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.forgotPassword({ email })
      .then(() => {
        setResult("sent");
        return actionSuccess();
      })
      .catch(actionFailure);
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
      <ForgotPasswordForm onSubmit={onSubmit} backLink="../login" />
    </AuthLayout>
  );
}
