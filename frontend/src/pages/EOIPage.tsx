import { Button, Container, Stack, TextInput, Title, Text, Textarea } from "@mantine/core";
import { Anchor } from "../components";

export default function EOIPage() {
  return (
    <Container pt="lg" pb="xl">
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1}>Expression of Interest</Title>
          <Title order={2} c="dimmed">
            Rhubarb Collective
          </Title>
        </Stack>

        <Stack gap="md">
          <Text>
            Hi there, you can use this form to express your interest in participating in the Rhubarb Collective. The Rhubarb Collective is not a membership organisation, it's a multi-site housing project driven by an
            emerging group of participants.
          </Text>
          <Text>
            Before expressing your interest, please read about what participating in the Rhubarb Collective involves in <Anchor href="https://radhousing.org/brassica/handbook/participation">our handbook</Anchor>.
          </Text>
          <Text>
            We have a decentralised process for inviting participants who express interest based on our capacity for onboarding new people. The details you provide here will help us reach out to you, if/when any current
            participants have the capacity to support you to get involved in the projet.
          </Text>
        </Stack>

        <form>
          <Stack gap="lg">
            <Stack gap="md">
              <TextInput label="Name" placeholder="How would you like us to refer to you?" required />

              <Textarea label="Interest" description="What interests you about participating in the Rhubarb Collective?" placeholder="Your message" rows={6} required />
              <Textarea
                label="Context"
                description="What areas that the Rhubarb Collective is involved in are you already familiar with, and which ones are ones you're interested in learning more about?"
                placeholder="Your message"
                rows={6}
                required
              />
              <Textarea rows={2} label="How did you hear about us?" description="Where did you hear about the Rhubarb Collective?" />
              <Textarea
                rows={3}
                label="Transformative justice"
                description="Recognising that we all have the capacity to cause or experience harm - is there anything you would like to share about your experiences of learning and healing from conflict?"
                placeholder="Feel free to share here, or let us know if you would prefer to discuss this in person."
              />

              <Textarea rows={2} label="Existing connections" description="Are there any connections to other Rhubarb Collective participants that you'd like to tell us about?" />

              <Textarea rows={2} label="Contact info" description="Your email, phone, or any other way you would prefer us to reach you" />
            </Stack>
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
