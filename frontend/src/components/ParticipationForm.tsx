import { Stepper, Group, Button, Stack, Textarea, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { CollectiveInvolvementWithDetails, OptOutType, ParticipationIntention } from "../api/Api";

export interface MyParticipationFormData {
  wellbeing: string;
  focus: string;
  capacity: string;
  participation_intention: ParticipationIntention | null;
  opt_out_type: OptOutType | null;
  opt_out_planned_return_date: string | null;
}

type StepProps = {
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
};

function CapacityStep({ form, readOnly }: StepProps) {
  return (
    <Stack>
      <Textarea
        disabled={readOnly}
        label="Wellbeing"
        description="How is your wellbeing and energy? What is likely to impact it positively or negatively?"
        key={form.key("wellbeing")}
        {...form.getInputProps("wellbeing")}
      />
      <Textarea
        disabled={readOnly}
        label="Focus"
        description="Where are you likely to be directing your time, energy and attention? Do you have any commitments, events or responsibilities coming up?"
        key={form.key("focus")}
        {...form.getInputProps("focus")}
      />
      <Textarea
        disabled={readOnly}
        label="Capacity"
        description="Given the context of your life (above), how would you describe your capacity to participate in the Brassica Collective this interval"
        key={form.key("capacity")}
        {...form.getInputProps("capacity")}
      />
    </Stack>
  );
}

type MinimumParticipationStepProps = StepProps & {};

function MinimumParticipationStep({ form, readOnly }: MinimumParticipationStepProps) {
  const [showOptOut, setShowOptOut] = useState(form.values.participation_intention === "OptOut");
  const [showHiatus, setShowHiatus] = useState(form.values.opt_out_type === "Hiatus");

  form.watch("participation_intention", ({ value }) => {
    setShowOptOut(value === "OptOut");
  });

  form.watch("opt_out_type", ({ value }) => {
    setShowHiatus(value === "Hiatus");
  });

  return (
    <Stack>
      <Select
        label="Participation intention"
        description="Would you like to participate in the Brassica Collective this interval?"
        placeholder="Pick value"
        disabled={readOnly}
        data={[
          { label: "Opt-in", value: "OptIn" },
          { label: "Opt-out", value: "OptOut" },
        ]}
        key={form.key("participation_intention")}
        {...form.getInputProps("participation_intention")}
      />
      {showOptOut && (
        <>
          <Select
            label="Opt-out Type"
            description="How would you like to opt-out?"
            placeholder="Pick value"
            disabled={readOnly}
            data={[
              { label: "Pause for now (hiatus)", value: "Hiatus" },
              { label: "Leave indefinately (exit)", value: "Exit" },
            ]}
            key={form.key("opt_out_type")}
            {...form.getInputProps("opt_out_type")}
          />
          {showHiatus && (
            <DatePickerInput
              disabled={readOnly}
              label="Planned return date"
              description="We'll give you a reminder one week before hand (if we've coded that bit)"
              placeholder="Pick date"
              key={form.key("opt_out_planned_return_date")}
              {...form.getInputProps("opt_out_planned_return_date")}
            />
          )}
        </>
      )}
    </Stack>
  );
}

// function AdditionalParticipationStep() {
//   return <div>Step 3 content: Get full access</div>;
// }

type ParticipationFormProps = {
  readOnly?: boolean;
  involvement?: CollectiveInvolvementWithDetails | null;
  onSubmit: (data: MyParticipationFormData) => void;
};

export default function ParticipationForm({ readOnly = false, involvement = null, onSubmit }: ParticipationFormProps) {
  const [step, setStep] = useState(0);
  const minStep = 0;
  const maxStep = 1;

  const form = useForm<MyParticipationFormData>({
    mode: "uncontrolled",
    initialValues: {
      wellbeing: involvement?.wellbeing || "",
      focus: involvement?.focus || "",
      capacity: involvement?.capacity || "",
      participation_intention: involvement?.participation_intention || null,
      opt_out_type: involvement?.opt_out_type || null,
      opt_out_planned_return_date: involvement?.opt_out_planned_return_date || null,
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
          participation_intention: values.participation_intention ? null : "Participation intention is required",
        };
        if (values.participation_intention === "OptOut") {
          results = {
            ...results,
            opt_out_type: values.opt_out_type ? null : "Opt-out type is required",
          };
          if (values.opt_out_type === "Hiatus") {
            results = {
              ...results,
              opt_out_planned_return_date: values.opt_out_planned_return_date ? null : "Planned return date is required",
            };
          }
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
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stepper active={step} onStepClick={setStepIfValid} iconSize={32}>
        <Stepper.Step label="Capacity">
          <CapacityStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        <Stepper.Step label="Minimum Participation">
          <MinimumParticipationStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        {/* <Stepper.Step label="Additional Participation">
          <AdditionalParticipationStep />
        </Stepper.Step> */}
        <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        {step > minStep && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}
        {step < maxStep && <Button onClick={nextStepIfValid}>Next step</Button>}
        {step === maxStep && !readOnly && <Button type="submit">Submit</Button>}
      </Group>
    </form>
  );
}
