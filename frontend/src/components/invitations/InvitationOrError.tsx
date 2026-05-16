import { type JSX, useState, useEffect } from "react";
import { getApi } from "../../api";
import type { CircleInvitationDetails } from "../../api/Api";
import { type ActionResult, actionSuccess, actionFailure, DisplayActionResult } from "../ActionResult";

export interface InvitationOrErrorProps {
  token: string;
  children: (details: CircleInvitationDetails) => JSX.Element;
}

export default function InvitationOrError({ token, children }: InvitationOrErrorProps) {
  const [invitation, setInvitation] = useState<CircleInvitationDetails | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);

  useEffect(() => {
    getApi()
      .api.getInvitation(token)
      .then((response) => {
        setInvitation(response.data);
        setActionResult(actionSuccess() || null);
      })
      .catch((error) => {
        setActionResult(actionFailure(error) || null);
      });
  }, [token]);

  if (actionResult && !actionResult.success) {
    return <DisplayActionResult result={actionResult} />;
  }

  if (invitation) {
    return children(invitation);
  }

  return null;
}
