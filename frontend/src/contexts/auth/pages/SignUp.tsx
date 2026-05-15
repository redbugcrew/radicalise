import { Text } from "@mantine/core";
import AuthLayout from "../components/AuthLayout";
import { useForm } from "@mantine/form";

export default function SignUp() {
  const form = useForm({
    mode: "uncontrolled",
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
    <AuthLayout title="Create your account">
      <Text>todo</Text>
    </AuthLayout>
  );
}
