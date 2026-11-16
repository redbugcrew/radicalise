import { Stack, Title } from "@mantine/core"
import InvitePersonForm from "../../components/invitations/InvitePersonForm"
import { handleAppEvents, useAppSelector } from "../../store"
import type { InvitePersonRequest } from "../../api/Api"
import { getApi } from "../../api"
import { actionFailure } from "../../components/ActionResult"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import { currentProjectPath } from "../../contexts/projects"

export default function InvitePerson() {
  const circles = useAppSelector((state) => state.circles.rootCircles)
  const project = useAppSelector((state) => state.project)
  const navigate = useNavigate()
  const projectId = project?.id

  if (!projectId) {
    console.error("Project ID is not available.")
    return null
  }

  const onSubmit = async (values: InvitePersonRequest) => {
    return getApi()
      .api.invitePerson(projectId, values)
      .then((response) => {
        const { events, person } = response.data
        handleAppEvents(events)
        notifications.show({
          title: "Invitation sent",
          message: `${person.display_name} has been invited successfully.`,
          color: "green",
        })
        navigate(currentProjectPath("/people", project.slug))
      })
      .catch((error) => {
        return actionFailure(error)
      })
  }

  return (
    <Stack>
      <Title>Invite person</Title>
      <InvitePersonForm onSubmit={onSubmit} circles={circles} />
    </Stack>
  )
}
