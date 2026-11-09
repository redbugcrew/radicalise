import { Anchor } from "../../../components"
import { getApi } from "../../../api"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"
import type { LoginFormData } from "../components/LoginForm"
import { actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult"
import LoginForm from "../components/LoginForm"
import { Button, Group, Stack } from "@mantine/core"
import { useUserPermissions } from "./auth_hooks"
import { useEffect } from "react"

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userPermissions = useUserPermissions()

  const onSubmit = ({ email, password }: LoginFormData): Promise<ActionPromiseResult> => {
    return getApi()
      .api.login({ email, password })
      .then(() => {
        navigate(searchParams.get("redirect") ?? "/")
        return actionSuccess()
      })
      .catch((error) => {
        console.error("Login failed:", error)
        return {
          success: false,
          error: "Invalid login details",
          login_needed: false,
        }
      })
  }

  useEffect(() => {
    if (userPermissions?.first_use) {
      navigate("../signup")
    }
  }, [userPermissions])

  return (
    <AuthLayout title="Welcome back!">
      <Stack gap="md">
        <LoginForm onSubmit={onSubmit} />

        <Group justify="space-between">
          {userPermissions?.signup_enabled && (
            <Button variant="outline" size="sm" component={Link} to="../signup">
              Sign up
            </Button>
          )}

          <Anchor href="../forgot_password" size="sm">
            Forgot password?
          </Anchor>
        </Group>
      </Stack>
    </AuthLayout>
  )
}
