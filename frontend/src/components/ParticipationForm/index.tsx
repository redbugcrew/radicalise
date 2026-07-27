import { Stepper, Group, Button, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { CircleInvolvement, Interval, IntervalData } from "../../api/Api";
import { IconLock } from "@tabler/icons-react";
import { useAppSelector } from "../../store";
import type { MyParticipationFormData } from "./shared";
import CapacityStep from "./CapacityStep";
import { ParticipationStep } from "./ParticipationStep";
import ContributionStep from "./ContributionStep";
import WithIntervalData from "../../pages/intervals/WithIntervalData";
import { findPreviousInterval } from "../../store/intervals";
import { forPerson } from "../../store/current_interval/crew_involvements";
export type { MyParticipationFormData } from "./shared";

interface ParticipationFormProps {
  personId: number;
  readOnly?: boolean;
  involvement?: CircleInvolvement | null;
  interval: Interval;
  onSubmit: (data: MyParticipationFormData) => void;
}

export default function ParticipationForm(props: ParticipationFormProps) {
  const previousInterval = useAppSelector((state) => findPreviousInterval(state.intervals, props.interval.id));

  return (
    <WithIntervalData interval={props.interval}>
      {({ intervalData }) => {
        if (!intervalData) {
          return <div>Loading interval data...</div>;
        }

        return (
          <WithIntervalData interval={previousInterval}>
            {({ intervalData: previousIntervalData }) => <ParticipationFormForInterval {...props} intervalData={intervalData} previousIntervalData={previousIntervalData ?? null} />}
          </WithIntervalData>
        );
      }}
    </WithIntervalData>
  );
}

interface ParticipationFormForIntervalProps extends ParticipationFormProps {
  intervalData: IntervalData;
  previousIntervalData: IntervalData | null;
}

function ParticipationFormForInterval({ personId, interval, readOnly = false, involvement = null, onSubmit, intervalData, previousIntervalData }: ParticipationFormForIntervalProps) {
  const circles = useAppSelector((state) => state.circles.rootCircles);
  const [step, setStep] = useState(0);
  const [additionalParticipationActive, setAdditionalParticipationActive] = useState(involvement?.participation_intention === "OptIn");

  const crewInvolvements = intervalData?.crew_involvements || [];
  const previousCrewInvolvements = previousIntervalData?.crew_involvements || [];

  const minStep = 0;
  const maxStep = additionalParticipationActive ? 2 : 1;

  const form = useForm<MyParticipationFormData>({
    mode: "controlled",
    initialValues: {
      capacity_planning_visibility_circle_id: involvement?.capacity_planning_visibility_circle_id ?? null,
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
          <Box mt="lg">
            <CapacityStep form={form} readOnly={readOnly} circles={circles} />
          </Box>
        </Stepper.Step>
        <Stepper.Step label="Participation">
          <Box mt="lg">
            <ParticipationStep form={form} readOnly={readOnly} interval={interval} />
          </Box>
        </Stepper.Step>
        <Stepper.Step label="Contribution" disabled={!additionalParticipationActive} allowStepSelect={additionalParticipationActive} icon={additionalParticipationActive ? null : <IconLock size={24} />}>
          <Box mt="lg">
            <ContributionStep form={form} readOnly={readOnly} personId={personId} interval={interval} crewInvolvements={crewInvolvements} previousInvolvements={previousCrewInvolvements} />
          </Box>
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
