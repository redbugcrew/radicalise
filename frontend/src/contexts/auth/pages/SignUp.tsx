import { useLocation, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { getApi } from "../../../api";
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = (values: any): Promise<ActionPromiseResult> => {
    return getApi()
      .api.signUp(values)
      .then((response) => {
        console.log("Sign up successful:", response);
        notifications.show({
          title: "Account created",
          message: "User created successfully.",
          color: "green",
        });
        navigate(`../login${location.search}`);
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
