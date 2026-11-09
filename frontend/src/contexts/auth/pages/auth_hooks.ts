import { useEffect, useState } from "react"
import type { UserPermissions } from "../../../api/Api"
import { getApi } from "../../../api"

export function useUserPermissions() {
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)

  useEffect(() => {
    getApi()
      .api.userPermissions()
      .then((response) => {
        setUserPermissions(response.data)
      })
      .catch((error) => {
        console.error("Failed to fetch login config:", error)
      })
  }, [])

  return userPermissions
}
