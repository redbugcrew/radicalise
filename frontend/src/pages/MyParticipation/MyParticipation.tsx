import { Container, Title, Stepper, Group, Button, Text, Stack, Textarea, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";

interface MyParticipationFormData {
  wellbeing: string;
  focus: string;
  capacity: string;
}

type StepProps = {
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
};

function CapacityStep({ form }: StepProps) {
  return (
    <Stack>
      <Textarea label="Wellbeing" description="How is your wellbeing and energy? What is likely to impact it positively or negatively?" {...form.getInputProps("wellbeing")} />
      <Textarea label="Focus" description="Where are you likely to be directing your time, energy and attention? Do you have any commitments, events or responsibilities coming up?" {...form.getInputProps("focus")} />
      <Textarea label="Capacity" description="Given the context of your life (above), how would you describe your capacity to participate in the Brassica Collective this interval" {...form.getInputProps("capacity")} />
    </Stack>
  );
}

function MinimumParticipationStep() {
  return (
    <Stack>
      <Select label="Participation status" description="Would you like to participate in the Brassica Collective this interval?" placeholder="Pick value" data={["Opt-out", "Opt-in"]} />
      <Select label="Opt-out Details" description="How would you like to opt-out?" placeholder="Pick value" data={["Pause for now (hiatus)", "Leave indefinately (exit)"]} />
      <DatePickerInput label="Planned return date" description="We'll give you a reminder one week before hand (if we've coded that bit)" placeholder="Pick date" />
    </Stack>
  );
}

function AdditionalParticipationStep() {
  return <div>Step 3 content: Get full access</div>;
}

export default function MyParticipation() {
  const [step, setStep] = useState(0);
  const minStep = 0;
  const maxStep = 2;

  const form = useForm<MyParticipationFormData>({
    mode: "uncontrolled",
    initialValues: {
      wellbeing: "",
      focus: "",
      capacity: "",
    },

    validate: (values) => {
      if (step === 0) {
        return {
          wellbeing: values.wellbeing.length > 0 ? null : "Wellbeing is required",
          focus: values.focus.length > 0 ? null : "Focus is required",
          capacity: values.capacity.length > 0 ? null : "Capacity is required",
        };
      }
      return {};
    },
  });

  const prevStep = () => setStep((current) => (current > minStep ? current - 1 : current));
  const nextStep = () => setStep((current) => (current < maxStep ? current + 1 : current));
  const nextStepIfValid = () => {
    if (form.validate().hasErrors) {
      return;
    }
    nextStep();
  };

  return (
    <Container>
      <Stack gap={0} mb="xl">
        <Title order={1} size="h2">
          Participating in Interval 10
        </Title>
        <Text>June 12th - July 17th</Text>
      </Stack>

      <form>
        <Stepper active={step} onStepClick={setStep} iconSize={32}>
          <Stepper.Step label="Capacity">
            <CapacityStep form={form} />
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
          {step > minStep && (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < maxStep && <Button onClick={nextStepIfValid}>Next step</Button>}
        </Group>
      </form>
    </Container>
  );
}
