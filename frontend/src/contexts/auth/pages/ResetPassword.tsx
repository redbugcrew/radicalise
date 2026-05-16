import { Container } from "@mantine/core";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApi } from "../../../api";
import AuthLayout from "../components/AuthLayout";
import type { ResetPasswordFormData } from "../components/ResetPasswordForm";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult";
import ResetPasswordForm from "../components/ResetPasswordForm";

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

  const onSubmit = ({ password }: ResetPasswordFormData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.resetPassword({ token, password })
      .then(() => {
        navigate("../login", { replace: true });
        return actionSuccess();
      })
      .catch(actionFailure);
  };

  return (
    <AuthLayout title="Reset your password">
      <ResetPasswordForm onSubmit={onSubmit} />
    </AuthLayout>
  );
}
