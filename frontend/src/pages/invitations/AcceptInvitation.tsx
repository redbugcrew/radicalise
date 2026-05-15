import { Stack, Title } from "@mantine/core";
import { useEffect, useState, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CircleInvitation } from "../../api/Api";
import { getApi } from "../../api";
import { actionFailure, actionSuccess, DisplayActionResult, type ActionResult } from "../../components/ActionResult";

interface TokenOrRedirectProps {
  children: (token: string) => JSX.Element;
  redirectTo?: string;
}

function TokenOrRedirect({ children, redirectTo }: TokenOrRedirectProps) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryToken = queryParams.get("token");
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!queryToken) {
      navigate(redirectTo ?? "/");
    } else {
      setToken(queryToken);
    }
  }, [queryToken]);

  if (!token) return null;
  return children(token);
}

interface InvitationOrErrorProps {
  token: string;
  children: (invitation: CircleInvitation) => JSX.Element;
}

function InvitationOrError({ token, children }: InvitationOrErrorProps) {
  const [invitation, setInvitation] = useState<CircleInvitation | null>(null);
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

export default function AcceptInvitation() {
  return (
    <TokenOrRedirect redirectTo="/">
      {(token) => (
        <InvitationOrError token={token}>
          {(invitation) => (
            <Stack>
              <Title>Accept invitation</Title>
              <div>Token: {token}</div>
            </Stack>
          )}
        </InvitationOrError>
      )}
    </TokenOrRedirect>
  );
}
