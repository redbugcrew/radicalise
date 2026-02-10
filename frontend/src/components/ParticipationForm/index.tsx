import { Stepper, Group, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { CollectiveInvolvement, Interval } from "../../api/Api";
import { IconLock } from "@tabler/icons-react";
import { useAppSelector } from "../../store";
import { forPerson, getMatchingInvolvementInterval } from "../../store/involvements";
import type { MyParticipationFormData } from "./shared";
import CapacityStep from "./CapacityStep";
import { ParticipationStep } from "./ParticipationStep";
import ContributionStep from "./ContributionStep";
export type { MyParticipationFormData } from "./shared";

interface ParticipationFormProps {
  personId: number;
  readOnly?: boolean;
  involvement?: CollectiveInvolvement | null;
  interval: Interval;
  previousIntervalId?: number | undefined;
  onSubmit: (data: MyParticipationFormData) => void;
}

export default function ParticipationForm({ personId, interval, previousIntervalId, readOnly = false, involvement = null, onSubmit }: ParticipationFormProps) {
  const involvements = useAppSelector((state) => state.involvements);
  const involvementInterval = getMatchingInvolvementInterval(involvements, interval.id);
  const crewInvolvements = involvementInterval?.crew_involvements || [];
  const [step, setStep] = useState(0);
  const [additionalParticipationActive, setAdditionalParticipationActive] = useState(involvement?.participation_intention === "OptIn");

  const previousInvolvements = typeof previousIntervalId === "number" ? getMatchingInvolvementInterval(involvements, previousIntervalId)?.crew_involvements : null;

  const minStep = 0;
  const maxStep = additionalParticipationActive ? 2 : 1;

  const form = useForm<MyParticipationFormData>({
    mode: "controlled",
    initialValues: {
      private_capacity_planning: involvement?.private_capacity_planning ?? false,
      wellbeing: involvement?.capacity_planning?.wellbeing ?? "",
      focus: involvement?.capacity_planning?.focus ?? "",
      capacity_score: involvement?.capacity_score?.toString() ?? null,
      capacity: involvement?.capacity_planning?.capacity ?? "",
      participation_intention: involvement?.participation_intention ?? null,
      opt_out_type: involvement?.opt_out_type ?? null,
      opt_out_planned_return_date: involvement?.opt_out_planned_return_date ?? null,
      crew_involvements: forPerson(crewInvolvements, personId),
      intention_context: involvement?.intention_context ?? null,
    },

    validate: (values) => {
      let results = {} as Record<keyof MyParticipationFormData, string | null>;

      if (step === 0) {
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

  form.watch("participation_intention", ({ value }) => {
    setAdditionalParticipationActive(value === "OptIn");
  });

  const prevStep = () => setStep((current) => (current > minStep ? current - 1 : current));
  const nextStep = () => setStep((current) => (current < maxStep ? current + 1 : current));
  const nextStepIfValid = () => {
    if (!readOnly && form.validate().hasErrors) return;

    nextStep();
  };
  const setStepIfValid = (newStep: number) => {
    if (!readOnly && form.validate().hasErrors) return;

    const editingExisting = involvement && involvement.id;

    if (editingExisting || newStep <= step + 1) {
      setStep(newStep);
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stepper active={step} onStepClick={setStepIfValid} iconSize={32} size="lg" mt="xl">
        <Stepper.Step label="Capacity">
          <CapacityStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        <Stepper.Step label="Participation">
          <ParticipationStep form={form} readOnly={readOnly} interval={interval} personId={personId} />
        </Stepper.Step>
        <Stepper.Step label="Contribution" disabled={!additionalParticipationActive} allowStepSelect={additionalParticipationActive} icon={additionalParticipationActive ? null : <IconLock size={24} />}>
          <ContributionStep form={form} readOnly={readOnly} personId={personId} intervalId={interval.id} crewInvolvements={crewInvolvements} previousInvolvements={previousInvolvements} />
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
        {step === maxStep && !readOnly && <Button type="submit">Submit</Button>}
      </Group>
    </form>
  );
}
