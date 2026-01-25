import { Badge, SegmentedControl } from "@mantine/core";
import { AttendanceIntention } from "../../../api/Api";
import { useState } from "react";

interface AttendanceSelectorProps {
  intention?: AttendanceIntention | null;
  onChange?: (intention: AttendanceIntention | null) => Promise<void>;
  readonly?: boolean;
}

const toTitleCase = (str: string) => {
  return str.replace(/([A-Z])/g, " $1").trim();
};

export default function AttendanceSelector({ intention, onChange, readonly }: AttendanceSelectorProps) {
  const possibleIntentions = [AttendanceIntention.Going, AttendanceIntention.Uncertain, AttendanceIntention.NotGoing];
  const [loading, setLoading] = useState(false);

  if (readonly) {
    const label = intention ? toTitleCase(intention) : "No Response";
    return <Badge color={intention ? "blue" : "gray"}>{label}</Badge>;
  }

  const onSelect = (value: string) => {
    if (!onChange) return;

    const intention: AttendanceIntention | null = value === "null" ? null : (value as AttendanceIntention);

    setLoading(true);
    onChange(intention).finally(() => setLoading(false));
  };

  return (
    <SegmentedControl
      onChange={onSelect}
      disabled={onChange && loading}
      data={possibleIntentions.map((intention) => ({ label: toTitleCase(intention), value: intention }))}
      value={intention ?? (null as any)}
      color="blue"
    />
  );
}
