import { getApi } from "../../../api";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

export default function SignUp() {
  const onSubmit = (values: any): Promise<ActionPromiseResult> => {
    return getApi()
      .api.signUp(values)
      .then((response) => {
        console.log("Sign up successful:", response);
        return actionSuccess();
      })
      .catch(actionFailure);
  };

  return (
    <AuthLayout title="Create your account">
      <LoginForm onSubmit={onSubmit} submitText="Sign up" />
    </AuthLayout>
  );
}
