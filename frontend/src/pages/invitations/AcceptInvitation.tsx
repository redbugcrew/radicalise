import { Container, Stack, Title, Text, Button } from "@mantine/core";
import { useEffect, useState, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CircleInvitationDetails } from "../../api/Api";
import { getApi } from "../../api";
import { actionFailure, actionSuccess, DisplayActionResult, type ActionResult } from "../../components/ActionResult";
import { capitalizeFirstLetter } from "../../utilities/string";

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
  children: (details: CircleInvitationDetails) => JSX.Element;
}

function InvitationOrError({ token, children }: InvitationOrErrorProps) {
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

export default function AcceptInvitation() {
  const navigate = useNavigate();

  return (
    <Container maw={600} my={40}>
      <TokenOrRedirect redirectTo="/">
        {(token) => (
          <InvitationOrError token={token}>
            {({ project, invitation, circle }) => (
              <Stack gap="md">
                <Stack gap={0} mb="md">
                  <Title order={2} c="dimmed" m={0}>
                    {project.name}
                  </Title>
                  <Title order={1} mt={0} lh={1.2}>
                    You have been invited to participate
                  </Title>
                </Stack>
                <Text size="lg">This is a platform for people to manage their own participation in projects, opting in to activities only when it fits their interest and capacity.</Text>

                <Text>
                  <strong>{capitalizeFirstLetter(project.noun_name ?? project.name ?? "This unnamed project")}</strong> would like to invite you to join their project, and engage in the circle called{" "}
                  <strong>{circle.name}</strong>.
                </Text>

                <Text>To accept this invitation, please create an account here, or log in if you already have one.</Text>

                <Button onClick={() => navigate(`/auth/signup?token=${encodeURIComponent(token)}`)}>Accept</Button>
              </Stack>
            )}
          </InvitationOrError>
        )}
      </TokenOrRedirect>
    </Container>
  );
}
