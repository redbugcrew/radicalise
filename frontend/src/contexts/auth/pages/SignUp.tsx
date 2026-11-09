import { useLocation, useNavigate } from "react-router-dom"
import { useLoginConfig } from "./auth_hooks"
import { notifications } from "@mantine/notifications"
import { getApi } from "../../../api"
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult"
import AuthLayout from "../components/AuthLayout"
import LoginForm from "../components/LoginForm"
import { Stack, Text } from "@mantine/core"
import { Anchor } from "../../../components"
import type { LoginFormData } from "../components/LoginForm"

export default function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginConfig = useLoginConfig()

  if (!loginConfig?.signup_enabled) {
    return (
      <AuthLayout title="Sign up disabled">
        <Text>Sign up is currently disabled.</Text>
      </AuthLayout>
    )
  }

  const onSubmit = (values: LoginFormData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.signUp(values)
      .then((response) => {
        console.log("Sign up successful:", response)
        notifications.show({
          title: "Account created",
          message: "User created successfully.",
          color: "green",
        })
        navigate(`../login${location.search}`)
        return actionSuccess()
      })
      .catch(actionFailure)
  }

  return (
    <AuthLayout
      title={loginConfig?.first_use ? "Welcome comrade 👋" : "Create your account"}
      content={
        loginConfig?.first_use ? (
          <Stack mt="md">
            <Text>
              <Text span fw="bold">
                Radicalise
              </Text>{" "}
              is an app to help your projects, groups and communities participate in active work through changing times and changing
              capacities.
            </Text>
            <Text>You are creating the first admin account for this application.</Text>
          </Stack>
        ) : undefined
      }
    >
      <Stack gap="md">
        <LoginForm onSubmit={onSubmit} submitText="Sign up" />

        {!loginConfig?.first_use && (
          <Text>
            Already have an account?{" "}
            <Anchor href={`../login${location.search}`} size="sm">
              Log in
            </Anchor>
          </Text>
        )}
      </Stack>
    </AuthLayout>
  )
}
