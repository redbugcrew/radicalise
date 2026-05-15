import { Anchor } from "../../../components";
import { getApi } from "../../../api";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import type { LoginFormData } from "../components/LoginForm";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult";
import LoginForm from "../components/LoginForm";
import { Stack } from "@mantine/core";

export default function Login() {
  const navigate = useNavigate();

  const onSubmit = ({ email, password }: LoginFormData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.login({ email, password })
      .then((_) => {
        navigate("/");
        return actionSuccess();
      })
      .catch((error) => {
        return actionFailure(error);
      });
  };

  return (
    <AuthLayout title="Welcome back!">
      <Stack gap="md">
        <LoginForm onSubmit={onSubmit} />

        <Anchor href="../forgot_password" size="sm">
          Forgot password?
        </Anchor>
      </Stack>
    </AuthLayout>
  );
}
