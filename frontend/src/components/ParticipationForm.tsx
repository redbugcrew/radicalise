import { Stepper, Group, Button, Stack, Textarea, Select, Title, Text, type SelectProps, Switch, Flex } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { CollectiveInvolvementWithDetails, Crew, CrewInvolvement, Interval, OptOutType, ParticipationIntention } from "../api/Api";
import { IconCheck, IconLock } from "@tabler/icons-react";
import { useAppSelector } from "../store";
import { forPerson, getMatchingInvolvementInterval } from "../store/involvements";
import { ComboTextArea, CrewParticipationsInput } from ".";
import type { ArrayOfStringTuples } from "./forms/ComboTextArea";
import CapacityScoreIcon from "./CapacityScoreIcon";

export interface MyParticipationFormData {
  private_capacity_planning: boolean;
  wellbeing: string;
  focus: string;
  capacity_score: string | null;
  capacity: string;
  participation_intention: ParticipationIntention | null;
  opt_out_type: OptOutType | null;
  opt_out_planned_return_date: string | null;
  crew_involvements: CrewInvolvement[];
}

type StepProps = {
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
};

const renderCapacityScoreOption: SelectProps["renderOption"] = ({ option, checked }) => (
  <Group flex="1" gap="xs">
    <CapacityScoreIcon score={option.value} />
    {option.label}
    {checked && <IconCheck style={{ marginInlineStart: "auto" }} />}
  </Group>
);

function CapacityStep({ form, readOnly }: StepProps) {
  return (
    <Stack mt="lg" gap="md">
      <Stack gap={0} mb="md">
        <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} gap="xs" mb={{ base: "md", sm: 0 }}>
          <Title order={3} m={0}>
            Plan your capacity
          </Title>
          <Switch label="Keep private" labelPosition="left" {...form.getInputProps("private_capacity_planning", { type: "checkbox" })} />
        </Flex>
        <Text c="dimmed">Optional questions to prompt reflection on life before planning your participation, sharing them with the group can help us be more aware of each other's needs.</Text>
      </Stack>

      <ComboTextArea
        disabled={readOnly}
        rows={4}
        label="Wellbeing"
        description="How is your wellbeing and energy?"
        key={form.key("wellbeing")}
        hints={
          [
            ["Excitable", "I'm feeling excitable"],
            ["Determined", "I'm feeling determined"],
            ["Mostly well", "I'm feeling mostly well"],
            ["Up and down", "I'm feeling up and down"],
            ["A bit meh", "I'm feeling a bit meh"],
            ["Overwhelmed", "I'm feeling overwhelmed"],
            ["Exhausted", "I'm feeling exhausted"],
          ] as ArrayOfStringTuples
        }
        {...form.getInputProps("wellbeing")}
      />
      <ComboTextArea
        disabled={readOnly}
        label="Focus"
        rows={4}
        description="Where are you likely to be directing your time, energy and attention? Do you have any commitments, events or responsibilities coming up?"
        hints={
          [
            ["surviving", "I'm focusing on surviving"],
            ["care responsibilities", "I'm focusing on care responsibilities"],
            ["generating income", "I'm focusing on generating income"],
            ["travel", "I'm focused on travel opportunities"],
            ["study", "I'm focusing on learning opportunities"],
            ["community projects", "I'm contributing to community projects"],
            ["social connection", "I'm nourishing my social connections"],
          ] as ArrayOfStringTuples
        }
        key={form.key("focus")}
        {...form.getInputProps("focus")}
      />
      <Select
        label={form.values.private_capacity_planning ? "Capacity (Shared with group)" : "Capacity"}
        description="Given the context of your life (above), how would you describe your capacity to participate in the Brassica Collective this interval?"
        placeholder="Pick value"
        disabled={readOnly}
        data={[
          { label: "Lower capacity", value: "-1" },
          { label: "My usual capacity", value: "0" },
          { label: "Higher capacity", value: "1" },
        ]}
        renderOption={renderCapacityScoreOption}
        key={form.key("capacity_score")}
        {...form.getInputProps("capacity_score")}
      />
      <Textarea disabled={readOnly} label="Further context" rows={4} description="Do you want to record any further context about your capacity? " key={form.key("capacity")} {...form.getInputProps("capacity")} />
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
    <Stack mt="lg" gap="md">
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

interface AdditionalParticipationStepProps {
  personId: number;
  intervalId: number;
  crewInvolvements: CrewInvolvement[];
  previousInvolvements?: CrewInvolvement[] | undefined | null;
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
}

function AdditionalParticipationStep({ form, readOnly, personId, intervalId, crewInvolvements, previousInvolvements }: AdditionalParticipationStepProps) {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap) as Crew[];
  const people = useAppSelector((state) => state.people);

  return (
    <Stack mt="lg" gap="md">
      <Stack gap={0} mb="md">
        <Group justify="space-between">
          <Title order={3}>Crews</Title>
        </Group>
        <Text c="dimmed">Without forming crews, nothing gets done. Crews don't run for the interval unless they have participants</Text>
      </Stack>

      <CrewParticipationsInput
        personId={personId}
        intervalId={intervalId}
        crews={crews}
        people={people}
        disabled={readOnly}
        crewInvolvements={crewInvolvements}
        previousInvolvements={previousInvolvements}
        key={form.key("crew_involvements")}
        {...form.getInputProps("crew_involvements")}
      />
    </Stack>
  );
}

interface ParticipationFormProps {
  personId: number;
  readOnly?: boolean;
  involvement?: CollectiveInvolvementWithDetails | null;
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
      wellbeing: involvement?.wellbeing ?? "",
      focus: involvement?.focus ?? "",
      capacity_score: involvement?.capacity_score?.toString() ?? null,
      capacity: involvement?.capacity ?? "",
      participation_intention: involvement?.participation_intention ?? null,
      opt_out_type: involvement?.opt_out_type ?? null,
      opt_out_planned_return_date: involvement?.opt_out_planned_return_date ?? null,
      crew_involvements: forPerson(crewInvolvements, personId),
    },

    validate: (values) => {
      let results = {} as Record<keyof MyParticipationFormData, string | null>;

      if (step === 0) {
        results = {
          ...results,
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
      <Stepper active={step} onStepClick={setStepIfValid} iconSize={32}>
        <Stepper.Step label="Capacity">
          <CapacityStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        <Stepper.Step label="Minimum Participation">
          <MinimumParticipationStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        <Stepper.Step label="Additional Participation" disabled={!additionalParticipationActive} allowStepSelect={additionalParticipationActive} icon={additionalParticipationActive ? null : <IconLock size={24} />}>
          <AdditionalParticipationStep form={form} readOnly={readOnly} personId={personId} intervalId={interval.id} crewInvolvements={crewInvolvements} previousInvolvements={previousInvolvements} />
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
