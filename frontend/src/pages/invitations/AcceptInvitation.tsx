import { Container, Stack, Title, Text, Button } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../../utilities/string";
import TokenOrRedirect from "../../components/invitations/TokenOrRedirect";
import InvitationOrError from "../../components/invitations/InvitationOrError";
import MaybeLoggedIn from "../../components/invitations/MaybeLoggedIn";
import { actionSuccess, DisplayActionResult, type ActionPromiseResult } from "../../components/ActionResult";
import { getApi } from "../../api";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

function AcceptInvitationLoggedOut() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack gap="md">
      <Text>To accept this invitation, please create an account here, or log in if you already have one.</Text>

      <Button onClick={() => navigate(`/auth/signup?redirect=${encodeURIComponent(location.pathname + location.search)}`)}>Sign up</Button>
    </Stack>
  );
}

interface AcceptInvitationLoggedInProps {
  token: string;
  onAuthFailure: () => void;
  onAccepted: () => void;
}

function AcceptInvitationLoggedIn({ token, onAuthFailure, onAccepted }: AcceptInvitationLoggedInProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActionPromiseResult | null>(null);

  const handleAccept = () => {
    setLoading(true);
    getApi()
      .api.acceptInvitation(token)
      .then(() => {
        setResult(actionSuccess());
        onAccepted();
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          notifications.show({
            title: "Authentication Required",
            message: "Your session has expired. Please log in again to accept the invitation.",
            color: "red",
          });
          onAuthFailure();
        } else {
          setResult({
            success: false,
            error: error.response?.data || "An error occurred while accepting the invitation.",
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Stack gap="md">
      <Text>You are logged in. You can accept the invitation below.</Text>

      {result ? <DisplayActionResult result={result} /> : null}

      <Button onClick={handleAccept} loading={loading}>
        Accept
      </Button>
    </Stack>
  );
}

export default function AcceptInvitation() {
  const navigate = useNavigate();

  const onAccepted = () => {
    notifications.show({
      title: "Invitation Accepted",
      message: "You have successfully accepted the invitation.",
      color: "green",
    });
    navigate("/people");
  };

  return (
    <Container maw={600} my={40}>
      <TokenOrRedirect redirectTo="/">
        {(token) => (
          <InvitationOrError token={token}>
            {({ project, circle }) => (
              <MaybeLoggedIn>
                {(loggedIn, handleAuthFailure) => (
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

                    {loggedIn ? <AcceptInvitationLoggedIn token={token} onAuthFailure={handleAuthFailure} onAccepted={onAccepted} /> : <AcceptInvitationLoggedOut />}
                  </Stack>
                )}
              </MaybeLoggedIn>
            )}
          </InvitationOrError>
        )}
      </TokenOrRedirect>
    </Container>
  );
}
