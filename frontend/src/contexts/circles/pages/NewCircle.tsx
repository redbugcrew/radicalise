import { Stack, Title } from "@mantine/core"
import CircleForm from "../components/CircleForm"
import { getApi } from "../../../api"
import type { Circle } from "../../../api/Api"
import { handleAppEvents, useAppSelector } from "../../../store"
import { useNavigate } from "react-router-dom"
import { actionFailure, type ActionPromiseResult } from "../../../components/ActionResult"

export default function NewCircle() {
  const navigate = useNavigate()
  const projectId = useAppSelector((state) => state.project?.id)

  if (!projectId) return null

  const handleSubmit = async (data: Circle): Promise<ActionPromiseResult> => {
    return getApi()
      .api.createCircle(projectId, data)
      .then((response) => {
        handleAppEvents(response.data)
        navigate("..")
      })
      .catch((error) => {
        return actionFailure(error)
      })
  }

  return (
    <Stack>
      <Title order={1}>New Circle</Title>

      <CircleForm onSubmit={handleSubmit} />
    </Stack>
  )
}
