import { Stack, Textarea, Select, Text, Alert } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";
import type { Interval, OptOutType, ParticipationIntention } from "../../api/Api";
import { IconDoorExit } from "@tabler/icons-react";
import { useAppSelector } from "../../store";
import type { StepProps } from "./shared";
import ExpectedParticipation from "./ExpectedParticipation";

type ParticipationStepProps = StepProps & {
  interval: Interval;
};

export function ParticipationStep({ form, readOnly, interval }: ParticipationStepProps) {
  const [intention, setIntention] = useState<ParticipationIntention | null>(form.values.participation_intention);
  const [optOutType, setOptOutType] = useState<OptOutType | null>(form.values.opt_out_type);
  const collective_noun_name = useAppSelector((state) => state.collective?.noun_name || "the collective");

  form.watch("participation_intention", ({ value }) => {
    setIntention(value);
  });

  form.watch("opt_out_type", ({ value }) => {
    setOptOutType(value);
  });

  const showOptOut = intention === "OptOut";
  const showHiatus = showOptOut && optOutType === "Hiatus";
  const showExpectedParticipation = intention === "OptIn";

  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Select
          label="Participation intention"
          description={`Would you like to participate in ${collective_noun_name} this interval?`}
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
              <>
                <DatePickerInput
                  disabled={readOnly}
                  label="Planned return date"
                  description="We'll give you a reminder one week before hand (if we've coded that bit)"
                  placeholder="Pick date"
                  key={form.key("opt_out_planned_return_date")}
                  {...form.getInputProps("opt_out_planned_return_date")}
                />
              </>
            )}
            {optOutType !== null && (
              <Textarea
                disabled={readOnly}
                label={optOutType === "Hiatus" ? "Hiatus context" : "Exit context"}
                rows={4}
                description={optOutType === "Hiatus" ? "Any context you would like to share about why you are taking a hiatus." : "Any context you would like to share about why you are exiting the collective."}
                key={form.key("intention_context")}
                {...form.getInputProps("intention_context")}
              />
            )}
            {optOutType === "Exit" && (
              <Alert variant="light" color="blue" title="Exiting" icon={<IconDoorExit />}>
                <Text>
                  This will move you into the exiting state, to be offboarded during this interval. No one is alerted at this stage, so don't hesitate to reach our to your buddy or to PAS crew if you have questions or
                  need faster action on offboarding.
                </Text>

                <Text mt="md">Once you exit, it's still possible to re-join. Just use the regular expression-of-interest pathway.</Text>
              </Alert>
            )}
          </>
        )}
      </Stack>

      {showExpectedParticipation && <ExpectedParticipation interval={interval} />}
    </Stack>
  );
}
