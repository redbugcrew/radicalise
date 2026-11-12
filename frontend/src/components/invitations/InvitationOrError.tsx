import { type JSX, useState, useEffect } from "react"
import { getApi } from "../../api"
import type { CircleInvitationDetails } from "../../api/Api"
import { type ActionResult, actionSuccess, actionFailure, DisplayActionResult } from "../ActionResult"

export interface InvitationOrErrorProps {
  token: string
  children: (details: CircleInvitationDetails) => JSX.Element
  onNotFound: JSX.Element
  projectSlug: string
}

export default function InvitationOrError({ token, children, onNotFound, projectSlug }: InvitationOrErrorProps) {
  const [invitation, setInvitation] = useState<CircleInvitationDetails | null>(null)
  const [actionResult, setActionResult] = useState<ActionResult | null>(null)

  useEffect(() => {
    getApi()
      .api.getInvitation(projectSlug, token)
      .then((response) => {
        setInvitation(response.data)
        setActionResult(actionSuccess() || null)
      })
      .catch((error) => {
        setActionResult(actionFailure(error) || null)
      })
  }, [token, projectSlug])

  if (actionResult) {
    if (!actionResult.success) {
      if (actionResult.error === "NotFound") {
        return onNotFound
      }
      return <DisplayActionResult result={actionResult} />
    }
  }

  if (invitation) {
    return children(invitation)
  }

  return null
}
