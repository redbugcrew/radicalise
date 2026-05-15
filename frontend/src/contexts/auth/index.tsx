import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";

export function buildRoutes() {
  return [
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "forgot_password",
      element: <ForgotPassword />,
    },
    {
      path: "reset_password",
      element: <ResetPassword />,
    },
    {
      path: "signup",
      element: <SignUp />,
    },
  ];
}
