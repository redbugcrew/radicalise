import { SegmentedControl } from "@mantine/core";
import { AttendanceIntention } from "../../../api/Api";
import { useState } from "react";

interface AttendanceSelectorProps {
  intention?: AttendanceIntention | null;
  onChange?: (intention: AttendanceIntention | null) => Promise<void>;
}

export default function AttendanceSelector({ intention, onChange }: AttendanceSelectorProps) {
  const possibleIntentions = [AttendanceIntention.Going, AttendanceIntention.Uncertain, AttendanceIntention.NotGoing];
  const [loading, setLoading] = useState(false);

  const onSelect = (value: string) => {
    if (!onChange) return;

    const intention: AttendanceIntention | null = value === "null" ? null : (value as AttendanceIntention);

    setLoading(true);
    onChange(intention).finally(() => setLoading(false));
  };

  return <SegmentedControl onChange={onSelect} disabled={onChange && loading} data={possibleIntentions} value={intention ?? (null as any)} color="blue" />;
}
