import { Stack, Textarea, Select, Title, Text, Switch, Flex, type SelectProps, Group } from "@mantine/core";
import { useAppSelector } from "../../store";
import { ComboTextArea } from "../";
import type { ArrayOfStringTuples } from "../forms/ComboTextArea";
import type { StepProps } from "./shared";
import { IconCheck } from "@tabler/icons-react";
import CapacityScoreIcon from "../CapacityScoreIcon";

export default function CapacityStep({ form, readOnly }: StepProps) {
  const collective_noun_name = useAppSelector((state) => state.collective?.noun_name || "the collective");

  return (
    <Stack gap="md">
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
        description={`Given the context of your life (above), how would you describe your capacity to participate in ${collective_noun_name} this interval?`}
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

const renderCapacityScoreOption: SelectProps["renderOption"] = ({ option, checked }) => (
  <Group flex="1" gap="xs">
    <CapacityScoreIcon score={option.value} />
    {option.label}
    {checked && <IconCheck style={{ marginInlineStart: "auto" }} />}
  </Group>
);
