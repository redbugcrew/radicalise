import { Anchor } from "../../../components"
import { getApi } from "../../../api"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"
import type { LoginFormData } from "../components/LoginForm"
import { actionSuccess, type ActionPromiseResult } from "../../../components/ActionResult"
import LoginForm from "../components/LoginForm"
import { Button, Group, Stack } from "@mantine/core"
import { useEffect, useState } from "react"
import type { LoginConfig } from "../../../api/Api"

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loginConfig, setLoginConfig] = useState<LoginConfig | null>(null)

  useEffect(() => {
    getApi()
      .api.loginConfig()
      .then((response) => {
        console.log("Login config:", response.data)
        setLoginConfig(response.data)
      })
      .catch((error) => {
        console.error("Failed to fetch login config:", error)
      })
  }, [])

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

  return (
    <AuthLayout title="Welcome back!">
      <Stack gap="md">
        <LoginForm onSubmit={onSubmit} />

        <Group justify="space-between">
          {loginConfig?.signup_enabled && (
            <Button variant="outline" size="sm" component={Link} to="../sign_up">
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
