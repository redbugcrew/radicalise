import { Card, Container, Stack, Title, Text } from "@mantine/core";
import { EOIForm, Markdown } from "../../components";
import { getApi } from "../../api";
import { useContext, useState } from "react";
import { EoiError, type EntryPathway, type ExpressionOfInterest } from "../../api/Api";
import { CollectiveContext } from "../PublicWithCollective";

interface EoiPageResult {
  eoi: EntryPathway | null;
  error: EoiError | null;
}

export default function CreateEoi() {
  const collective = useContext(CollectiveContext);
  const [result, setResult] = useState<EoiPageResult>({
    eoi: null,
    error: null,
  });

  if (collective.feature_eoi !== true) {
    return <Container>Expression of Interest is not enabled for this collective.</Container>;
  }

  const handleSubmit = (values: ExpressionOfInterest): Promise<void> => {
    return getApi()
      .api.createEoi(values)
      .then((_) => {
        setResult({ eoi: values, error: null });
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          const errorEnum = error.response.data as EoiError;
          setResult({ eoi: null, error: errorEnum });
        }
      });
  };

  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Expression of Interest</Title>
          <Title order={2} c="dimmed">
            {collective.name}
          </Title>
        </Stack>

        {result.eoi && (
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Thank you for your interest!</Title>
              <Text>You will receive a confirmation email which contains links to edit or withdraw your interest.</Text>
            </Stack>
          </Card>
        )}

        {result.error && result.error === EoiError.EmailAlreadyExists && (
          <Card withBorder style={{ borderColor: "var(--mantine-color-red-5)" }}>
            <Stack gap="md">
              <Title order={3}>I think we already have a submission from you</Title>
              <Text>
                We already have an expression of interest for {collective.noun_name ?? "this collective"} from that email. If you would like to update your interest, you shoul have received an email with a link to edit
                or delete your original submission.
              </Text>
            </Stack>
          </Card>
        )}

        {result.error && result.error !== EoiError.EmailAlreadyExists && (
          <Card withBorder style={{ borderColor: "var(--mantine-color-red-5)" }}>
            <Stack gap="md">
              <Title order={3}>Sorry, there was an error with your submission</Title>
              <Text>Something is broken on our end. Please try again later, or contact the collective via other means.</Text>
            </Stack>
          </Card>
        )}

        {!result.error && !result.eoi && (
          <>
            <Markdown children={collective.eoi_description} />
            <EOIForm onSubmit={handleSubmit} collective={collective} />
          </>
        )}
      </Stack>
    </Container>
  );
}
