import { Button, Card, Stack, TextInput, Textarea, Title, Text, List, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Collective, Eoi } from "../api/Api";

interface EOIFormProps {
  collective: Collective;
  onSubmit: (values: Eoi) => Promise<void>;
}

export default function EOIForm({ onSubmit, collective }: EOIFormProps) {
  const form = useForm<Eoi>({
    mode: "controlled",
    initialValues: {
      id: -1, // Placeholder ID, will be set by the backend
      collective_id: collective.id,
      name: "",
      interest: "",
      context: "",
      referral: "",
      conflict_experience: "",
      participant_connections: "",
      email: "",
    },
    validate: {
      name: (value) => (value ? null : "Name is required"),
      email: (value) => (value ? null : "Email is required"),
    },
  });

  const noun_name = collective.noun_name ?? "the collective";
  const name = collective.name ?? "collective";

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      {form.submitting && <LoadingOverlay />}
      <Stack gap="lg">
        <Stack gap="md">
          <TextInput label="Name" placeholder="How would you like us to refer to you?" {...form.getInputProps("name")} />

          <Textarea label="Interest" description={`What interests you about participating in ${noun_name}?`} placeholder="Your message" rows={6} {...form.getInputProps("interest")} />
          <Textarea
            label="Context"
            description={`What areas that the ${noun_name} is involved in are you already familiar with, and which ones are ones you're interested in learning more about?`}
            placeholder="Your message"
            rows={6}
            {...form.getInputProps("context")}
          />
          <Textarea rows={2} label="How did you hear about us?" description={`Where did you hear about the ${noun_name}?`} {...form.getInputProps("referral")} />

          <Textarea
            rows={3}
            label="Practicing transformative justice"
            description="Recognising that we all have the capacity to cause and experience harm - is there anything you would like to share about your experiences of learning and healing from conflict?"
            placeholder="Feel free to share here, or let us know if you would prefer to discuss this in person."
            {...form.getInputProps("conflict_experience")}
          />

          <Textarea rows={2} label="Participant connections" description={`Are there any connections to other ${name} participants that you'd like to tell us about?`} {...form.getInputProps("participant_connections")} />

          <TextInput
            label="Email"
            description="Your email address. This is used to contact you about your expression of interest or allow you to update or delete what you've written here"
            {...form.getInputProps("email")}
          />
        </Stack>
        <Card bg="var(--mantine-color-dark-6)" withBorder>
          <Stack gap="md">
            <Title order={3}>What we do with this data</Title>

            <Text>Your expression of interest will be used in the following ways:</Text>
            <List>
              <List.Item>
                <Text>
                  <strong>Email address:</strong> Used to send you an automated email with links allowing you to edit or delete your expression of interest.
                </Text>
              </List.Item>
              <List.Item>
                <Text>
                  <strong>Other fields:</strong> Displayed to all current and future participants in the collective so that they can opt-in to following up on your interest.
                </Text>
              </List.Item>
            </List>
            <Text>Your data will be permanently deleted when any one of the following occurs:</Text>
            <List>
              <List.Item>
                <Text>
                  <strong>You request deletion:</strong> If you decide to withdraw your expression of interest using the provided link, all of your data will be permanently deleted.
                </Text>
              </List.Item>
              <List.Item>
                <Text>
                  <strong>You're invited:</strong> If you are invited to participate in the collective, your expression of interest will be deleted.
                </Text>
              </List.Item>
              <List.Item>
                <Text>
                  <strong>One year has passed:</strong> Your expression of interest will be automatically deleted one year after submission.
                </Text>
              </List.Item>
            </List>
          </Stack>
        </Card>
        <Button type="submit" loading={form.submitting}>
          Submit
        </Button>
      </Stack>
    </form>
  );
}
