import { useEffect, useState } from "react"
import type { LoginConfig } from "../../../api/Api"
import { getApi } from "../../../api"

export function useLoginConfig() {
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

  return loginConfig
}
