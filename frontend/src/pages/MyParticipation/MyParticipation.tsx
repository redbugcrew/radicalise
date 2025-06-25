import { Container, Title, Stepper, Group, Button, Text, Stack, Textarea, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";

type ParticipationStatus = "OptOut" | "OptIn";
type OptOutType = "Hiatus" | "Exit";

interface MyParticipationFormData {
  wellbeing: string;
  focus: string;
  capacity: string;
  participation_status: ParticipationStatus | null;
  opt_out_type: OptOutType | null;
}

type StepProps = {
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
};

function CapacityStep({ form }: StepProps) {
  return (
    <Stack>
      <Textarea label="Wellbeing" description="How is your wellbeing and energy? What is likely to impact it positively or negatively?" key={form.key("wellbeing")} {...form.getInputProps("wellbeing")} />
      <Textarea
        label="Focus"
        description="Where are you likely to be directing your time, energy and attention? Do you have any commitments, events or responsibilities coming up?"
        key={form.key("focus")}
        {...form.getInputProps("focus")}
      />
      <Textarea
        label="Capacity"
        description="Given the context of your life (above), how would you describe your capacity to participate in the Brassica Collective this interval"
        key={form.key("capacity")}
        {...form.getInputProps("capacity")}
      />
    </Stack>
  );
}

type MinimumParticipationStepProps = StepProps & {};

function MinimumParticipationStep({ form }: MinimumParticipationStepProps) {
  const [showOptOut, setShowOptOut] = useState(form.values.participation_status === "OptOut");
  const [showHiatus, setShowHiatus] = useState(form.values.opt_out_type === "Hiatus");

  form.watch("participation_status", ({ value }) => {
    setShowOptOut(value === "OptOut");
  });

  form.watch("opt_out_type", ({ value }) => {
    setShowHiatus(value === "Hiatus");
  });

  return (
    <Stack>
      <Select
        label="Participation status"
        description="Would you like to participate in the Brassica Collective this interval?"
        placeholder="Pick value"
        data={[
          { label: "Opt-in", value: "OptIn" },
          { label: "Opt-out", value: "OptOut" },
        ]}
        key={form.key("participation_status")}
        {...form.getInputProps("participation_status")}
      />
      {showOptOut && (
        <>
          <Select
            label="Opt-out Type"
            description="How would you like to opt-out?"
            placeholder="Pick value"
            data={[
              { label: "Pause for now (hiatus)", value: "Hiatus" },
              { label: "Leave indefinately (exit)", value: "Exit" },
            ]}
            key={form.key("opt_out_type")}
            {...form.getInputProps("opt_out_type")}
          />
          {showHiatus && <DatePickerInput label="Planned return date" description="We'll give you a reminder one week before hand (if we've coded that bit)" placeholder="Pick date" />}
        </>
      )}
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
      participation_status: null,
      opt_out_type: null,
    },

    validate: (values) => {
      let results = {};

      if (step === 0) {
        results = {
          ...results,
          wellbeing: values.wellbeing.length > 0 ? null : "Wellbeing is required",
          focus: values.focus.length > 0 ? null : "Focus is required",
          capacity: values.capacity.length > 0 ? null : "Capacity is required",
        };
      }
      if (step === 1) {
        results = {
          ...results,
          participation_status: values.participation_status ? null : "Participation status is required",
        };
        if (values.participation_status === "OptOut") {
          results = {
            ...results,
            opt_out_type: values.opt_out_type ? null : "Opt-out type is required",
          };
        }
      }

      return results;
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
  const setStepIfValid = (newStep: number) => {
    if (newStep <= step || (newStep === step + 1 && !form.validate().hasErrors)) {
      setStep(newStep);
    }
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
        <Stepper active={step} onStepClick={setStepIfValid} iconSize={32}>
          <Stepper.Step label="Capacity">
            <CapacityStep form={form} />
          </Stepper.Step>
          <Stepper.Step label="Minimum Participation">
            <MinimumParticipationStep form={form} />
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
