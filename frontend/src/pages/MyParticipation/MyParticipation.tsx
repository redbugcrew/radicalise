import { Container, Title, Stepper, Group, Button, Text, Stack, Textarea, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";

function CapacityStep() {
  return (
    <form>
      <Stack>
        <Textarea label="Wellbeing" description="How is your wellbeing and energy? What is likely to impact it positively or negatively?" placeholder="Input placeholder" />{" "}
        <Textarea label="Focus" description="Where are you likely to be directing your time, energy and attention? Do you have any commitments, events or responsibilities coming up?" placeholder="Input placeholder" />
        <Textarea label="Capacity" description="Given the context of your life (above), how would you describe your capacity to participate in the Brassica Collective this interval" placeholder="Input placeholder" />
      </Stack>
    </form>
  );
}

function MinimumParticipationStep() {
  return (
    <form>
      <Stack>
        <Select label="Participation status" description="Would you like to participate in the Brassica Collective this interval?" placeholder="Pick value" data={["Opt-out", "Opt-in"]} />
        <Select label="Opt-out Details" description="How would you like to opt-out?" placeholder="Pick value" data={["Pause for now (hiatus)", "Leave indefinately (exit)"]} />
        <DatePickerInput label="Planned return date" description="We'll give you a reminder one week before hand (if we've coded that bit)" placeholder="Pick date" />
      </Stack>
    </form>
  );
}

function AdditionalParticipationStep() {
  return <div>Step 3 content: Get full access</div>;
}

export default function MyParticipation() {
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Container>
      <Stack gap={0} mb="xl">
        <Title order={1} size="h2">
          Participating in Interval 10
        </Title>
        <Text>June 12th - July 17th</Text>
      </Stack>

      <Stepper active={active} onStepClick={setActive} iconSize={32}>
        <Stepper.Step label="Capacity">
          <CapacityStep />
        </Stepper.Step>
        <Stepper.Step label="Minimum Participation">
          <MinimumParticipationStep />
        </Stepper.Step>
        <Stepper.Step label="Additional Participation">
          <AdditionalParticipationStep />
        </Stepper.Step>
        <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>Next step</Button>
      </Group>
    </Container>
  );
}
