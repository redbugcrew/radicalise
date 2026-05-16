import { Anchor } from "../../../components";
import { getApi } from "../../../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import type { LoginFormData } from "../components/LoginForm";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult";
import LoginForm from "../components/LoginForm";
import { Stack } from "@mantine/core";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onSubmit = ({ email, password }: LoginFormData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.login({ email, password })
      .then((_) => {
        navigate(searchParams.get("redirect") ?? "/");
        return actionSuccess();
      })
      .catch(actionFailure);
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
