import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useUserPermissions } from "./auth_hooks"
import { notifications } from "@mantine/notifications"
import { getApi } from "../../../api"
import { actionFailure, actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult"
import AuthLayout from "../components/AuthLayout"
import LoginForm from "../components/LoginForm"
import { Stack, Text } from "@mantine/core"
import { Anchor } from "../../../components"
import type { LoginFormData } from "../components/LoginForm"
import type { SignUpRequest } from "../../../api/Api"

export default function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const userPermissions = useUserPermissions()

  const invitation_token = searchParams.get("invitation")

  if (!userPermissions?.signup_enabled && !invitation_token) {
    return (
      <AuthLayout title="Sign up disabled">
        <Text>Sign up is currently disabled.</Text>
      </AuthLayout>
    )
  }

  const onSubmit = async (formValues: LoginFormData): Promise<ActionPromiseResult> => {
    const values: SignUpRequest = {
      ...formValues,
      invite_token: invitation_token || null,
    }

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
      .catch((error) => {
        return actionFailure(error)
      })
  }

  return (
    <AuthLayout
      title={userPermissions?.first_use ? "Welcome comrade 👋" : "Create your account"}
      content={
        userPermissions?.first_use ? (
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

        {!userPermissions?.first_use && (
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
